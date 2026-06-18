const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { generateCustomItinerary } = require('../utils/itineraryEngine');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

router.post('/generate', async (req, res) => {
    try {
        const questionnaireData = req.body;

        console.log('📝 Generating itinerary for:', questionnaireData);

        const itinerary = await generateCustomItinerary(questionnaireData);

        const itineraryId = uuidv4();
        await pool.execute(
            `INSERT INTO questionnaire_responses 
            (response_id, session_id, interests, budget, exact_days, preferred_destinations, 
             accommodation_type, starting_point, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                itineraryId,
                questionnaireData.session_id || uuidv4(),
                JSON.stringify(questionnaireData.interests),
                questionnaireData.budget,
                questionnaireData.exact_days,
                JSON.stringify(questionnaireData.preferred_destinations),
                questionnaireData.accommodation_type,
                questionnaireData.starting_point
            ]
        );

        res.json({
            success: true,
            itinerary_id: itineraryId,
            itinerary: itinerary
        });
    } catch (error) {
        console.error('Error generating itinerary:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate itinerary' 
        });
    }
});

router.get('/:id/map-data', async (req, res) => {
    try {
        const { id } = req.params;

        const [questionnaire] = await pool.execute(
            'SELECT * FROM questionnaire_responses WHERE response_id = ?',
            [id]
        );

        if (questionnaire.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Itinerary not found' 
            });
        }

        const itinerary = await generateCustomItinerary(questionnaire[0]);

        res.json({
            success: true,
            map_data: {
                destinations: itinerary.destinations.map(d => ({
                    id: d.destination_id,
                    name: d.destination_name,
                    lat: parseFloat(d.latitude),
                    lng: parseFloat(d.longitude),
                    day: d.day,
                    type: d.type,
                    description: d.description
                })),
                hotels: itinerary.hotels.map(h => ({
                    id: h.hotel_id,
                    name: h.hotel_name,
                    lat: parseFloat(h.latitude),
                    lng: parseFloat(h.longitude),
                    price: parseFloat(h.price_per_night_usd),
                    type: h.type,
                    destination: h.destination_name
                })),
                route: itinerary.destinations,
                total_distance: itinerary.total_distance
            }
        });
    } catch (error) {
        console.error('Error fetching map data:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch map data' 
        });
    }
});

// TODO: Implement a picture of the map into the PDF
// - Generate static map image using Google Maps Static API or Mapbox
// - Embed the map image showing the route with markers
// - Add legend for day numbers and destinations

router.post('/generate-pdf', async (req, res) => {
    try {
        const { itinerary, destinations } = req.body;

        if (!itinerary || !destinations) {
            return res.status(400).json({ success: false, error: 'Missing itinerary data' });
        }

        const pdfDir = path.join(__dirname, '..', 'pdfs');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        const filename = `itinerary-${Date.now()}.pdf`;
        const filepath = path.join(pdfDir, filename);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header with logo and company info
        const logoPath = path.join(__dirname, '..', 'lanka-vacation-official-logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 40, { width: 60 });
        }
        
        doc.fontSize(18).font('Helvetica-Bold').text('Lanka Vacations (Pvt) Ltd.', 120, 45, { width: 250 });
        doc.fontSize(9).font('Helvetica').text('Your Journey, Our Passion', 120, 68);

        // Contact info on the right
        doc.fontSize(8).font('Helvetica').text('Phone: +94 777 325 515', 400, 45, { align: 'right', width: 145 });
        doc.fontSize(8).text('Email: clientservice@lanka-vacations.com', 400, 58, { align: 'right', width: 145 });

        // Horizontal line
        doc.moveTo(50, 95).lineTo(545, 95).stroke();
        doc.moveDown(2);

        // Title
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#2d5f4d').text('Your Custom Itinerary', 50, 110, { align: 'center' });
        doc.fillColor('#000000');
        doc.moveDown(2);

        // Trip Overview Box
        doc.rect(50, doc.y, 495, 80).fillAndStroke('#f5f5f5', '#cccccc');
        doc.fillColor('#000000');
        const overviewY = doc.y + 15;
        doc.fontSize(14).font('Helvetica-Bold').text('Trip Overview', 70, overviewY);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Duration: ${itinerary.duration_days} days`, 70, overviewY + 25);
        doc.text(`Budget: ${itinerary.estimated_cost}`, 70, overviewY + 40);
        doc.text(`Starting Point: ${itinerary.starting_point || 'Colombo'}`, 70, overviewY + 55);
        
        doc.y += 95;
        doc.moveDown(1);

        // Day by day itinerary
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#2d5f4d').text('Daily Itinerary', 50);
        doc.fillColor('#000000');
        doc.moveDown(1);

        destinations.forEach((dest, index) => {
            if (doc.y > 680) {
                doc.addPage();
                doc.y = 50;
            }

            // Day header with colored background
            const headerY = doc.y;
            doc.rect(50, headerY, 495, 25).fillAndStroke('#f97a1f', '#f97a1f');
            doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
            doc.text(`Day ${dest.day}: ${dest.destination_name}`, 60, headerY + 7);
            doc.fillColor('#000000');
            doc.y = headerY + 25;
            
            doc.y += 10;
            doc.fontSize(10).font('Helvetica').text(dest.description || 'Explore this beautiful destination', 60, doc.y, { width: 475 });
            doc.moveDown(0.5);
            
            if (dest.activities && dest.activities.length > 0) {
                doc.fontSize(9).font('Helvetica-Bold').text('Activities:', 60);
                doc.font('Helvetica');
                dest.activities.forEach(activity => {
                    doc.fontSize(9).text(`  - ${activity}`, 70, doc.y, { width: 465 });
                });
                doc.moveDown(0.3);
            }
            
            if (dest.hotel_name) {
                doc.fontSize(9).font('Helvetica-Oblique').text(`Accommodation: ${dest.hotel_name}`, 60);
            }
            
            doc.moveDown(1.5);
        });

        // Route Map section
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#2d5f4d').text('Route Map', 50, 50);
        doc.fillColor('#000000');
        doc.moveDown(1);

        // Generate static map URL
        const locations = destinations.map(d => `${d.destination_name}`).join(' -> ');
        doc.fontSize(10).font('Helvetica').text('Your journey route:', 50);
        doc.moveDown(0.5);
        
        // Route list with arrows
        destinations.forEach((dest, index) => {
            const isLast = index === destinations.length - 1;
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#f97a1f').text(`${index + 1}. ${dest.destination_name}`, 70, doc.y);
            doc.fillColor('#000000');
            if (!isLast) {
                doc.fontSize(16).text('  |', 70, doc.y);
                doc.fontSize(16).text('  v', 70, doc.y);
            }
            doc.moveDown(0.3);
        });

        doc.moveDown(2);
        doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
        doc.text('Note: This is a suggested itinerary. Actual routes and timings may vary based on weather and local conditions.', 50, doc.y, { width: 495, align: 'center' });

        // Add footer to last page
        doc.fontSize(8).fillColor('#999999').text(
            'Generated by Lanka Vacations - Your trusted travel partner since 1984',
            50, 770,
            { align: 'center', width: 495 }
        );

        doc.end();

        stream.on('finish', () => {
            res.json({
                success: true,
                pdfUrl: `/pdfs/${filename}`,
                filename: filename
            });
        });

        stream.on('error', (error) => {
            console.error('PDF generation error:', error);
            res.status(500).json({ success: false, error: 'Failed to generate PDF' });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, error: 'Failed to generate PDF' });
    }
});

module.exports = router;
