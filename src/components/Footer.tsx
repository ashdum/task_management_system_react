import React from 'react';
import { Github, Gitlab, Linkedin, FileText, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-gray-400">
            © {new Date().getFullYear()}, Made with ❤️ by Ashot Dumikyan
          </p>
          
          <div className="flex items-center gap-4">
            <a
              href="tel:+37477556021"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="+374 77 556021"
            >
              <Phone size={20} />
            </a>
            <a
              href="mailto:ashot.dumikyan@gmail.com"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="ashot.dumikyan@gmail.com"
            >
              <Mail size={20} />
            </a>
            <a
              href="https://github.com/ashdum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://gitlab.com/works8931046"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="GitLab"
            >
              <Gitlab size={20} />
            </a>
            <a
              href="http://www.linkedin.com/in/ashot-dumikyan-484b91235"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://drive.google.com/file/d/1rpwULEoMKdbvjNOAORlT-4R3FjVleBlT/view"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="Resume"
            >
              <FileText size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;