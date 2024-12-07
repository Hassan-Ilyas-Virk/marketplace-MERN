import React, { useState, useEffect } from 'react';
import pic1 from '../media/pic1.jpg';
import pic2 from '../media/pic2.jpg';
import pic3 from '../media/pic3.jpg';

const HomeSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: pic1,
      title: 'Welcome to Our Marketplace'
    },
    {
      image: pic2,
      title: 'Discover Amazing Deals'
    },
    {
      image: pic3,
      title: 'Shop with Confidence'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-8 my-6">
      <div className="relative w-full h-[400px] overflow-hidden rounded-lg shadow-lg">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', slide.image);
                e.target.src = 'https://via.placeholder.com/1920x600';
              }}
            />
            <div 
              className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                transition-opacity duration-300 flex items-center justify-center
                ${currentSlide === index ? 'hover:opacity-100' : ''}`}
            >
              <h2 className="text-white text-4xl font-bold text-center px-4">
                {slide.title}
              </h2>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 z-20"
          aria-label="Previous slide"
        >
          ❮
        </button>
        <button
          onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 z-20"
          aria-label="Next slide"
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default HomeSlideshow; 