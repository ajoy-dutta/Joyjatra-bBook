// src/components/layout/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 text-sm font-sans">
      {/* Main footer grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4 bg-gray-200 leading-relaxed">
        {/* Contact info */}
        <div>
          <h3 className="text-base font-semibold mb-2 text-green-700">Contact Us</h3>
          <p className="mt-1">
            <strong>📍 Address:</strong> Near Judge Court Mor, Jashore
          </p>
          <p className="mt-1">
            <strong>📞 Phone:</strong> 02223389807
          </p>
          <p className="mt-1">
            <strong>✉️ Email:</strong> jashorebar@gmail.com
          </p>
          <p className="mt-1">
            <strong>🕒 Working Days:</strong> Sunday–Thursday (Govt. office hours).<br />
            Friday, Saturday and Govt. holidays: closed.
          </p>
        </div>

        {/* Quick links column 1 */}
        <div>
          <h3 className="text-base font-semibold mb-2 text-green-700">Quick links</h3>
          <ul className="space-y-1 text-green-900 font-medium list-disc list-inside">
            <li>
              <a href="/about" className="hover:text-green-500">
                About us
              </a>
            </li>
            <li>
              <a href="/programs" className="hover:text-green-500">
                Programs
              </a>
            </li>
            <li>
              <a href="/donate" className="hover:text-green-500">
                Donate
              </a>
            </li>
            <li>
              <a href="/volunteer" className="hover:text-green-500">
                Volunteer
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-green-500">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Quick links column 2 */}
        <div>
          <h3 className="text-base font-semibold mb-2 text-green-700">Useful resources</h3>
          <ul className="space-y-1 text-green-900 font-medium list-disc list-inside">
            <li>
              <a href="https://bangabhaban.gov.bd/" className="hover:text-green-500">
                Office of the Hon’ble President
              </a>
            </li>
            <li>
              <a href="https://www.supremecourt.gov.bd/web/indexn.php" className="hover:text-green-500">
                Supreme Court of Bangladesh
              </a>
            </li>
            <li>
              <a href="https://lawjusticediv.gov.bd/" className="hover:text-green-500">
                Law & Justice Division
              </a>
            </li>
            <li>
              <a href="https://www.parliament.gov.bd/" className="hover:text-green-500">
                Bangladesh Parliament
              </a>
            </li>
            <li>
              <a href="https://bangladesh.gov.bd/index.php" className="hover:text-green-500">
                Bangladesh National Portal
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-300 text-center text-gray-700 py-1 text-sm">
        <p>© 2025 All rights reserved.</p>
        <p>Developed by Utshab Technology Ltd.</p>
      </div>
    </footer>
  );
};

export default Footer;
