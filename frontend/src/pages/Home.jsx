import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, LineChart as ChartLine } from 'lucide-react';
import Entry from '../components/Entry'
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Entry></Entry>
  
      <section className="py-10 px-4 bg-blue-100">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Student Management</h3>
              <p className="text-gray-600">
                Efficiently manage student batches, track progress, and monitor project development.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Faculty Collaboration</h3>
              <p className="text-gray-600">
                Seamless interaction between faculty members, coordinators, and data entry operators.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                <ChartLine className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-gray-600">
                Real-time progress monitoring and comprehensive reporting system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join EduPortal today and transform your educational management experience.
          </p>
          <a href="/signup">  {/* Link to the Sign Up page */}
    <button className="bg-gradient-to-r from-[#FFD700] to-[#fea707] text-black font-semibold px-8 py-3 rounded-full transition-transform transform hover:scale-105">
      Create Account
    </button>
  </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
