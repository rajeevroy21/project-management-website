import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Target, Heart, ChevronRight, 
  Users, Trophy, Globe, ArrowRight, Sparkles
} from 'lucide-react';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('mission');
  const [stats, setStats] = useState({ students: 0, countries: 0, awards: 0 });

  useEffect(() => {
    setIsVisible(true);
    // Animate stats
    const targetStats = { students: 15000, countries: 50, awards: 120 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        students: Math.floor(targetStats.students * progress),
        countries: Math.floor(targetStats.countries * progress),
        awards: Math.floor(targetStats.awards * progress),
      });

      if (currentStep === steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const tabContent = {
    mission: {
      title: "Our Mission",
      icon: GraduationCap,
      color: "indigo",
      content: "Empowering minds through innovative education, fostering creativity, and building future leaders who make a difference in the world.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1500&q=80"
    },
    vision: {
      title: "Our Vision",
      icon: Target,
      color: "purple",
      content: "To be a globally recognized institution that sets the standard for educational excellence and drives positive change in society.",
      image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1500&q=80"
    },
    values: {
      title: "Our Values",
      icon: Heart,
      color: "pink",
      content: "Built on integrity, embracing diversity, pursuing excellence, and fostering a lifelong commitment to learning and community service.",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1500&q=80"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-indigo-300/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-pink-300/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className={`container mx-auto px-6 py-20 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-block">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Shaping Tomorrow's Leaders
            </span>
          </div>
          <h1 className="text-7xl font-bold text-gradient drop-shadow-md">
            About Us
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-light">
            Transforming education through innovation and excellence, creating tomorrow's leaders today.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          {[
            { icon: Users, label: 'Students', value: stats.students.toLocaleString() },
            { icon: Globe, label: 'Countries', value: stats.countries },
            { icon: Trophy, label: 'Awards', value: stats.awards }
          ].map((stat, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-400/20 rounded-full animate-pulse-ring"></div>
                <div className="relative z-10 h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <div className="stat-number">{stat.value}+</div>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Interactive Tabs */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="flex justify-center space-x-4 mb-10">
            {Object.entries(tabContent).map(([key, { title, icon: Icon, color }]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 ${
                  activeTab === key 
                    ? `bg-${color}-600 text-white shadow-lg` 
                    : `bg-white/50 text-gray-600 hover:bg-${color}-50`
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{title}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative h-[400px] rounded-3xl overflow-hidden glass-card">
            {Object.entries(tabContent).map(([key, { title, content, image }]) => (
              <div
                key={key}
                className={`absolute inset-0 transition-all duration-500 transform ${
                  activeTab === key ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="absolute inset-0">
                  <img src={image} alt={title} className="w-full h-full object-cover opacity-20" />
                </div>
                <div className="relative h-full flex items-center justify-center p-12">
                  <div className="max-w-2xl text-center">
                    <h3 className="text-3xl font-bold mb-6 text-gradient">{title}</h3>
                    <p className="text-xl text-gray-700 leading-relaxed">{content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto glass-card px-12 py-10 rounded-3xl transform hover:scale-105 transition-all duration-300">
            <p className="text-gray-600 font-light text-lg mb-6">
              Join us in our journey to transform education and create a brighter future for all.
            </p>
            <button className="group px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 flex items-center mx-auto">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;