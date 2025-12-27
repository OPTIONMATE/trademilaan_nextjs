// File: trademilaan/src/components/ContactDetails.jsx
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactDetails = () => {
  return (
    <div className="w-full space-y-6">
      {/* Contact Information Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
          Get in Touch
        </h2>
        
        <div className="space-y-6">
          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Phone
              </h3>
              <a 
                href="tel:+917702262206" 
                className="text-lg text-neutral-900 hover:text-purple-600 transition-colors"
              >
                +91 77022 62206
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Email
              </h3>
              <a 
                href="mailto:info@trademilan.com" 
                className="text-lg text-neutral-900 hover:text-purple-600 transition-colors break-all"
              >
                info@trademilan.com
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Address
              </h3>
              <p className="text-sm text-neutral-900">
              1 2 4, 29 4 Kummaripalem Centerr, Near D S M, High School, Vidyadharapuram, Vijayawada, VIJAYAWADA, ANDHRA PRADESH, 520012
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="w-full h-[300px] md:h-[400px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.1234567890123!2d80.6480153!3d16.5061743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35effc2c8b8b8b%3A0x1234567890abcdef!2sVijayawada%2C%20Andhra%20Pradesh%2C%20India!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Trademilan Location"
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;