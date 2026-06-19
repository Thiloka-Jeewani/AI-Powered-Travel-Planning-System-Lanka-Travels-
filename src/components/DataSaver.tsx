// components/DataSaver.tsx - UPDATED VERSION
import { useState } from 'react';

// Types matching your existing data structure
interface QuestionnaireData {
    session_id: string;
    travel_timing: string;
    travel_duration_range: string;
    budget: string;
    traveler_type: string;
    accommodation_type: string;
    num_travelers: number;
    traveler_composition: { adults: number; children: number };
    room_type_preference: string;
    meal_plan_preference: string;
    interests: string[];
    preferred_destinations: string[];
    starting_point: string;
    transport_preference: string;
    exact_days: number;
    random_plan_selected: boolean;
    ai_enabled: boolean;
    full_name?: string;
    email?: string;
    phone?: string;
    country?: string;
    city?: string;
    whatsapp_number?: string;
    special_requirements?: string;
}

interface BookingData {
    full_name: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    whatsapp_number: string;
    emergency_contact: string;
    special_requirements?: string;
    total_booking_amount: number;
    booking_status: string;
    itinerary_data: any;
    questionnaire_data: any;
    questionnaire_response_id?: string;
}

const useDataSaver = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Save questionnaire to Flask API endpoint
    const saveQuestionnaireDirect = async (data: QuestionnaireData): Promise<{success: boolean; response_id?: string; error?: string}> => {
        try {
            setLoading(true);
            setMessage('Saving questionnaire to AI server...');

            console.log('📤 Sending questionnaire data to Flask API:', data);

            // Use Flask API endpoint - port 5000
            const response = await fetch('http://localhost:5000/api/save-questionnaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('📥 Questionnaire save response:', result);

            if (result.success) {
                setMessage('✅ Questionnaire saved successfully to AI database!');
                return {
                    success: true,
                    response_id: result.response_id || result.session_id || `resp_${Date.now()}`
                };
            } else {
                setMessage(`❌ Failed: ${result.error || result.message || 'Unknown error'}`);
                return { success: false, error: result.error || result.message };
            }
        } catch (error: any) {
            console.error('❌ Error saving questionnaire:', error);
            setMessage(`❌ Error: ${error.message}`);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Save booking to Flask API endpoint
    const saveBookingDirect = async (data: BookingData): Promise<{success: boolean; booking_id?: string; error?: string}> => {
        try {
            setLoading(true);
            setMessage('Saving booking to AI server...');

            console.log('📤 Sending booking data to Flask API:', data);

            // Use Flask API endpoint - port 5000
            const response = await fetch('http://localhost:5000/api/save-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('📥 Booking save response:', result);

            if (result.success) {
                setMessage('✅ Booking saved successfully to AI database!');
                return {
                    success: true,
                    booking_id: result.booking_id || result.id || `book_${Date.now()}`
                };
            } else {
                setMessage(`❌ Failed: ${result.error || result.message || 'Unknown error'}`);
                return { success: false, error: result.error || result.message };
            }
        } catch (error: any) {
            console.error('❌ Error saving booking:', error);
            setMessage(`❌ Error: ${error.message}`);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        saveQuestionnaireDirect,
        saveBookingDirect,
        loading,
        message,
        setMessage
    };
};

export default useDataSaver;