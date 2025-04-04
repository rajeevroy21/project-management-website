import React from 'react';
import {
  BookOpen,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      <div className="container mx-auto">
        {/* Top Section with Logo and Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 py-12">
          {/* University Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-blue-400">VFSTR</span>
            </div>
            <p className="font-semibold text-lg">
              Vignan's Foundation for Science, Technology & Research
            </p>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-1 text-blue-400" />
                <p>
                  Vadlamudi, Guntur District
                  <br />
                  Andhra Pradesh - 522213
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-400" />
                <a
                  href="https://www.vignan.ac.in"
                  className="hover:text-blue-400 transition-colors"
                >
                  www.vignan.ac.in
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.vignan.ac.in/academics"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Academics
                </a>
              </li>
              <li>
                <a
                  href="https://www.vignan.ac.in/research"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Research
                </a>
              </li>
              <li>
                <a
                  href="https://www.vignan.ac.in/admissions"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Admissions
                </a>
              </li>
              <li>
                <a
                  href="https://www.vignan.ac.in/campus-life"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Campus Life
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              Contact Us
            </h3>
            <div className="space-y-4">
              <a
                href="tel:+918632344700"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>0863-2344700</span>
              </a>
              <a
                href="mailto:info@vignan.ac.in"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>info@vignan.ac.in</span>
              </a>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="h-5 w-5" />
                <span>Mon - Sat: 9:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              Connect With Us
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="https://www.facebook.com/vignanuniversity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span>Facebook</span>
              </a>
              <a
                href="https://twitter.com/vignanuniversity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span>Twitter</span>
              </a>
              <a
                href="https://www.linkedin.com/school/vignan's-foundation-for-science-technology-&-research/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://www.instagram.com/vignanuniversity/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section with Copyright */}
        <div className="border-t border-gray-700 px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} Vignan University Magazine Portal.
              All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a
                href="/privacy"
                className="hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-blue-400 transition-colors"
              >
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}