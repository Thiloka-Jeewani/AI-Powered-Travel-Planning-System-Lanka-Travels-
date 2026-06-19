import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-[#2d5f3f] to-[#1a3d2b]">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Contact Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-2xl h-full">
              <h2 className="font-serif text-4xl md:text-5xl font-normal text-[#6b5d4f] mb-3">
                Contact Us
              </h2>
              <p className="text-gray-600 mb-8">
                Just enter your message below.
              </p>

              <form className="space-y-5">
                <div>
                  <Input 
                    placeholder="Name*" 
                    required
                    className="w-full border-gray-300 focus:border-[#c87941] focus:ring-[#c87941] text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Input 
                    type="tel"
                    placeholder="Phone Number*" 
                    required
                    className="w-full border-gray-300 focus:border-[#c87941] focus:ring-[#c87941] text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Input 
                    type="email"
                    placeholder="Email Address*" 
                    required
                    className="w-full border-gray-300 focus:border-[#c87941] focus:ring-[#c87941] text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Input 
                    placeholder="Subject" 
                    className="w-full border-gray-300 focus:border-[#c87941] focus:ring-[#c87941] text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Textarea 
                    placeholder="Enter your message*"
                    rows={6}
                    required
                    className="w-full border-gray-300 focus:border-[#c87941] focus:ring-[#c87941] text-gray-700 placeholder:text-gray-400 resize-none"
                  />
                </div>

                <Button 
                  type="submit"
                  className="bg-[#c87941] hover:bg-[#b86835] text-white px-10 py-6 text-base font-medium transition-colors rounded-md"
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Google Map */}
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden h-full min-h-[600px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7986545369365!2d79.85396007496856!3d6.914682993082055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259651b1e8c6f%3A0x5e0c8c5e5e5e5e5e!2s43%20St%20Anthony's%20Mawatha%2C%20Colombo%2000300%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1234567890123!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lanka Vacations Location - 43 St Anthony's Mawatha, Colombo 00300"
                className="w-full h-full"
              />
            </div>

            {/* Get In Touch */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-2xl h-full flex flex-col justify-center">
              <h2 className="font-serif text-4xl md:text-5xl font-normal text-[#6b5d4f] mb-8 text-center">
                Get In Touch
              </h2>
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-[#c87941]/10 p-6 rounded-full">
                    <Phone className="w-8 h-8 text-[#c87941]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Call Us</p>
                    <a href="tel:+94777325515" className="text-xl font-semibold text-gray-800 hover:text-[#c87941] transition-colors">
                      +94 777 325 515
                    </a>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-[#c87941]/10 p-6 rounded-full">
                    <Mail className="w-8 h-8 text-[#c87941]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Email Us</p>
                    <a href="mailto:clientservice@lanka-vacations.com" className="text-xl font-semibold text-gray-800 hover:text-[#c87941] transition-colors break-all">
                      clientservice@lanka-vacations.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;