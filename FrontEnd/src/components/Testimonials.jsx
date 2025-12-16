import React from 'react'
import { useState , useEffect , useRef} from "react";

const testimonials = [
  {
    quote: "I always cared about the planet, but Green ID made it feel measurable and fun. Now, I plant trees and earn rewards.",
    name: "Ananya Singh",
    role: "Environmental Activist",
    img : "brand.jpg" ,
  },
  {
    quote: "The idea that my daily routine — walking, composting — actually earns me points is brilliant. Feels like karma cash!",
    name: "Ravi Kumar",
    role: "Student, Delhi",
    img : "mist.jpg" ,
  },
  {
    quote: "I gifted my mom a coupon from Green ID points — she was so proud of me. It’s more than an app, it’s a movement",
    name: "Meera Patel",
    role: "Teacher",
    img : "mountain.jpg" ,
  },
];

const Testimonials = () => {
    
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Autoplay every 5s, but pause on hover
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % testimonials.length);
      }, 2000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  return (
    <div className='h-full w-full relative flex justify-center'>
    <div
      className="w-full  flex justify-center p-8  backdrop-blur-md rounded-xl shadow-2xl relative overflow-hidden group "
      onMouseEnter={() => {
        clearInterval(intervalRef.current);
        setIsPaused(true);
      }}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute h-[65vh] w-[70%] bottom-8">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`absolute w-full rounded-2xl inset-0 text-center px-4 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out 
                ${i === index ? "opacity-100 scale-100 z-10" : "opacity-0 scale-90 z-0"}`}
            style={{
            backgroundImage: `url(${t.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            } }
            >
        <div className="bg-black/40 p-6 rounded-xl z-10">
            <p className="text-xl italic text-white">"{t.quote}"</p>
            <p className="mt-6 font-bold text-white text-lg">{t.name}</p>
            <p className="text-sm text-gray-500">{t.role}</p>
        </div>
      </div>

        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 gap-2 absolute bottom-10">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-3 w-3 rounded-full transition-all ${
              i === index ? "bg-green-500 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Prev/Next Buttons */}
      <button
        onClick={goToPrev}
        className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-full hover:bg-white/60 transition"
      >
        ◀
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-full hover:bg-white/60 transition"
      >
        ▶
      </button>
    </div>
    </div>
  );
}

export default Testimonials
