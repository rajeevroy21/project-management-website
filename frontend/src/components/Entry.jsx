import React from 'react';
import Typewriter from 'typewriter-effect';
import ProjectImage from '../../Images/project.jpg';  // Replace with your image path

const VignanPortalSection = () => {
  return (
    <section className="bg-white py-12"> {/* Reduced height with less vertical padding */}

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12 px-8">

        {/* Left Side: Text with Typewriter Effect */}
        <div className="flex-1 text-left">
          <h1 className="text-4xl font-extrabold leading-snug tracking-wide">  {/* Larger heading */}
            <span className="text-blue-900">
              <Typewriter
                options={{
                  strings: [
                    'Welcome to Vignan Project Portal',
                    'Collaborate. Create. Conquer.'
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 75,
                }}
              />
            </span>
          </h1>

          <p className="text-lg mt-6 leading-relaxed text-black">  {/* Larger font size */}
            🎯Simplify complexity, boost productivity, and lead your projects to success with Vignan’s innovative platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-6">
          <a href="/signup">  {/* Link to the Sign Up page */}
    <button className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold px-8 py-3 rounded-full shadow-md transition-transform transform hover:scale-105">
      Get Started
    </button>
  </a>
          <a href="/signup">  
            <button className="bg-transparent border-2 border-blue-900 text-blue-900 font-semibold px-8 py-3 rounded-full shadow-md hover:bg-blue-900 hover:text-white transition-transform transform hover:scale-105">
              Learn More
            </button>
            </a>
          </div>
        </div>

        {/* Right Side: Larger Image */}
        <div className="flex-1 flex justify-center">
          <img 
            src={ProjectImage} 
            alt="Project Management" 
            className="w-full max-w-lg rounded-lg "  /* Larger image with shadow */
          />
        </div>

      </div>
    </section>
  );
};

export default VignanPortalSection;
