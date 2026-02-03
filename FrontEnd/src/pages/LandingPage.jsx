import React from 'react'
import { useNavigate } from 'react-router-dom'
import PlantSpline from '../components/PlantSpline'
import Spline from '@splinetool/react-spline'
import Family from '../components/Family'
import ProfileCard from '../blocks/Components/ProfileCard/ProfileCard'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Testimonials from '../components/Testimonials'
import { FaSquareInstagram } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";


const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className='w-screen h-screen overflow-x-hidden '>
      {/* navbar */}
      <div className='flex justify-around  items-center w-screen  py-5 '>
          <div className='flex w-35'><img src="./logo.png" alt="" /></div>
          <div className='flex  gap-14 text-lg border px-10 py-3 rounded-2xl bg-[#f0f6eb13]'>
              <a href="#Mission"><div className='hover:bg-[#00bf63] px-4 py-2 rounded-xl transition duration-200 ease-in-out'>
                Mission
              </div></a>
              <a href="#partners"><div className='hover:bg-[#00bf63] px-4 py-2 rounded-xl transition duration-200 ease-in-out'>Partners</div></a>
              <a href=""><div className='hover:bg-[#00bf63] px-4 py-2 rounded-xl transition duration-200 ease-in-out'>Leaderboard</div></a>
              <a href=""><div className='hover:bg-[#00bf63] px-4 py-2 rounded-xl transition duration-200 ease-in-out'>About Us</div></a>
          </div>
          <div className='flex gap-5'>
              <button onClick={() => navigate('/signup')} className='border-1 px-5 py-3 hover:bg-[#ffffff] hover:text-black font-bold rounded-4xl'>Sign-Up</button>
              <button onClick={() => navigate('/login')} className='border-1 px-5 py-3 bg-[#ffffff] text-black font-bold rounded-4xl'>Log-In</button>
          </div>
      </div>

      {/* // hero */}
      <div className='flex' id='home'>
        <div className='h-[85vh]  w-[55%] flex flex-col pt-30 items-center px-30'>
          <h1 className='hero text-6xl mb-8 font-medium'>Green ID : Your Badge for a Greener Tomorrow</h1>
          <p className='text-2xl mb-12'>Earn points for your everyday eco-actions. Track your impact, unlock rewards, and join a community of changemakers.</p>
          <button onClick={() => navigate('/signup')} className='border-3 rounded-3xl px-5 py-2 text-xl bg-[#00bf63] hover:bg-[#274536] font-extrabold'>Start Now</button>
        </div>
        <div className='h-[85vh] w-[45%]'><PlantSpline/></div>
      </div>

      {/* // Mission */}
      <div className='h-screen pt-15 ' id='Mission'>
        <div>
          <div className=' text-7xl pb-10 font-extrabold'>Our Mission</div>
        </div>
        <div className='flex px-30'>
          <div className=' pr-20 '>
            <span className='hover:shadow-[0_0_80px]
         hover:shadow-green-300'> <ProfileCard/></span> 
          </div>
          <div className='pl-10 border  bg-[#f0f6eb0e] rounded-4xl w-[70%] flex flex-col px-15 pt-15 ml-5 drop-shadow-[0_4px_100px_rgba(137,101,255,1)] hover:drop-shadow-[0_0px_100px_rgba(74,222,128,0.5)] transition-all duration-1000 ease-in-out hover:shadow-[0_0_50px]
         hover:shadow-green-300' >
            <div className=' text-3xl pl-20 text-left'>Our mission is simple yet powerful:</div>
            <div className='flex flex-col gap-10 text-2xl text-left items-center justify-between px-20 pt-10'>
              <div>Just like every citizen has an Aadhaar to prove their identity, every individual deserves a <span className='font-extrabold text-green-300'>Green ID</span> — a badge of honor for their love for the planet.</div>
              <div>Green ID recognizes and rewards your eco-efforts with real-world impact and brand coupons, turning sustainability into a lifestyle.</div>
            </div>
          </div>
        </div>
        <br />
        {/* <div class="bg-green-500 h-64 clip-wavy"></div> */}
        {/* //how it works */}
        <div className='px-20 py-10 h-screen ' id='howItWorks'>
          <div className='text-6xl font-extrabold text-start pb-10'>How it works ?</div>
          <div className='cards flex justify-center  gap-5 hover:drop-shadow-[0_0px_100px_rgba(74,222,128,0.5)]'>
            <div className='relative group h-[70vh] w-[20%] hover:w-[40%] bg-red-500 border-3 rounded-3xl overflow-hidden transition-all duration-1000 ease-in-out'>
              <img src="./mountain1.jpg" alt="signup" className='w-full h-full object-cover'/>
              <div className='absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black to-transparent'></div>
              <div className="absolute bottom-3 p-4 text-white z-10 ">
                  <h2 className="text-2xl text-left font-bold">Get Your Green ID</h2>
                  <p className='text-left hidden opacity-0 group-hover:block group-hover:opacity-100 transition-opacity duration-1000'>Sign up to receive your digital Green ID—your personal badge for sustainable living.</p>
              </div>    
            </div>
            
            <div className='relative group h-[70vh] w-[20%] hover:w-[40%] bg-red-500 border-3 rounded-3xl overflow-hidden transition-all duration-1000 ease-in-out'>
              <img src="./plant.jpg" alt="signup" className='w-full h-full object-cover'/>
              <div className='absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black to-transparent'></div>
              <div className="absolute bottom-3 p-4 text-white z-10 ">
                  <h2 className="text-2xl text-left font-bold">Log Eco-Friendly Actions</h2>
                  <p className='text-left hidden opacity-0 group-hover:block group-hover:opacity-100 transition-opacity duration-1000'>Watered plants? Recycled plastic? Carpooled? Log your green actions in seconds via our platform.</p>
              </div>    
            </div>
            
            <div className='relative group h-[70vh] w-[20%] hover:w-[40%] bg-red-500 border-3 rounded-3xl overflow-hidden transition-all duration-1000 ease-in-out'>
              <img src="./mist.jpg" alt="signup" className='w-full h-full object-cover'/>
              <div className='absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black to-transparent'></div>
              <div className="absolute bottom-3 p-4 text-white z-10 ">
                  <h2 className="text-2xl text-left font-bold">Earn Points for Your Actions</h2>
                  <p className='text-left hidden opacity-0 group-hover:block group-hover:opacity-100 transition-opacity duration-1000'>Every verified action gives you eco-points. The more consistent your habits, the more you earn.</p>
              </div>    
            </div>
            
            <div className='relative group h-[70vh] w-[20%] hover:w-[40%] bg-red-500 border-3 rounded-3xl overflow-hidden transition-all duration-1000 ease-in-out'>
              <img src="./brand.jpg" alt="signup" className='w-full h-full object-cover'/>
              <div className='absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black to-transparent'></div>
              <div className="absolute bottom-3 p-4 text-white z-10 ">
                  <h2 className="text-2xl text-left font-bold">Unlock Exclusive Brand Rewards</h2>
                  <p className='text-left hidden opacity-0 group-hover:block group-hover:opacity-100 transition-opacity duration-1000'>Redeem points for coupons from eco-conscious brands and partners who support your green efforts.</p>
              </div>    
            </div>
            
            <div className='relative group h-[70vh] w-[20%] hover:w-[40%] bg-red-500 border-3 rounded-3xl overflow-hidden transition-all duration-1000 ease-in-out'>
              <img src="./leaderboard.jpg" alt="signup" className='w-full h-full object-cover'/>
              <div className='absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black to-transparent'></div>
              <div className="absolute bottom-3 p-4 text-white z-10 ">
                  <h2 className="text-2xl text-left font-bold">Rise Up the Leaderboard</h2>
                  <p className='text-left hidden opacity-0 group-hover:block group-hover:opacity-100 transition-opacity duration-1000'>Compete with other eco-champions, showcase your Green ID proudly, and inspire change.</p>
              </div>    
            </div>
            
          </div>
        </div>

        {/* //Goal & impaact */}
        <div className='relative h-screen px-20 py-5 grid grid-cols-10 grid-rows-12 bg-red'>
          <div className='text-left col-span-12 row-span-4 font-extrabold text-9xl'>
            <p>Track. Transform. Thrive.</p>
          </div>
          <div className='border-2 col-span-12 rounded-3xl absolute w-[80%] h-[30%] left-[12.25%] -top-25 row-span-12 col-start-4 row-start-5 overflow-hidden'>
            <video
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
              src="https://res.cloudinary.com/dur08hmgf/video/upload/v1754320182/13329067_4096_2160_30fps_nzj3lt.mp4"
              muted 
              loop
              autoPlay
              // onMouseEnter={e => e.currentTarget.play()}
              // onMouseLeave={e => {
              // e.currentTarget.pause();
              // e.currentTarget.currentTime = 1000;
              // }}
            />
          </div>
          <div className=' col-span-12 row-span-12 col-start-1 row-start-6 p-0 m-0'>
            <div className='grid grid-cols-6 grid-rows-6 gap-2 h-full w-full p-0 m-0'>
              <div className='border-2 rounded-3xl col-start-1 row-start-1 col-end-3 row-end-3 overflow-hidden'>
                <video
                  className="inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                  src="https://res.cloudinary.com/dur08hmgf/video/upload/v1754321012/8452082-uhd_3840_2160_30fps_hxi7zv.mp4"
                  muted 
                  // autoPlay
                  loop
                  onMouseEnter={e => e.currentTarget.play()}
                  onMouseLeave={e => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              </div>

              <div className='border-2 rounded-3xl col-start-1 row-start-3 col-end-2 row-end-7 overflow-hidden'>
                <video
                  className="inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 brightness-150"
                  src="https://res.cloudinary.com/dur08hmgf/video/upload/v1754321224/4324109-uhd_3840_2160_24fps_fqwgqf.mp4"
                  muted 
                  // autoPlay
                  loop
                  onMouseEnter={e => e.currentTarget.play()}
                  onMouseLeave={e => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              </div>

              <div className='border-2 rounded-3xl col-start-2 row-start-3 col-end-4 row-end-7 overflow-hidden'>
                <video
                  className="inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                  src="https://res.cloudinary.com/dur08hmgf/video/upload/v1754316981/4503301-uhd_4096_2160_25fps_zgu2pg.mp4"
                  muted 
                  // autoPlay
                  loop
                  onMouseEnter={e => e.currentTarget.play()}
                  onMouseLeave={e => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              </div>

              <div className='border-2 rounded-3xl col-start-3 row-start-1 col-end-4 row-end-3 overflow-hidden'>
                <video
                  className="inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                  src="https://res.cloudinary.com/dur08hmgf/video/upload/v1754318223/7048759-uhd_3840_2160_30fps_hr67o2.mp4"
                  muted 
                  // autoPlay
                  loop
                  onMouseEnter={e => e.currentTarget.play()}
                  onMouseLeave={e => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              </div>

              <div className='border-2  rounded-3xl col-start-4 row-start-1 col-end-7 row-end-4 overflow-hidden'>
                <video
                  className="inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                  src="https://res.cloudinary.com/dur08hmgf/video/upload/v1754316982/13612271_3840_2160_25fps_grozmi.mp4"
                  muted 
                  autoPlay
                  loop
                  // onMouseEnter={e => e.currentTarget.play()}
                  // onMouseLeave={e => {
                  //   e.currentTarget.pause();
                  //   e.currentTarget.currentTime = 0;
                  // }}
                />
              </div>

              <div className='border-2  rounded-3xl col-start-4 row-start-4 col-end-6 row-end-7 overflow-hidden'>
                <video
                  className="inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                  src="https://res.cloudinary.com/dur08hmgf/video/upload/v1754318848/855181-hd_1920_1080_25fps_exe95j.mp4"
                  muted 
                  // autoPlay
                  loop
                  onMouseEnter={e => e.currentTarget.play()}
                  onMouseLeave={e => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              </div>

              <div className=' border-2 bg-green-300 rounded-3xl col-start-6 row-start-4 col-end-7 row-end-7 overflow-hidden p-0 '>
                <img className='w-full h-full object-cover' src="logo1.png" alt="" />
              </div>
            </div>
          </div>
        </div>

        {/* testimonials */}

        <div className=' pt-15 pb-5 px-20 ' id='testimonials'>
          <div className='text-7xl font-extrabold '>Testimonials</div>
          <div className='h-[75vh] flex items-center drop-shadow-[0_0px_100px_rgba(74,222,128,0.6)]'>
              <Testimonials/>
          </div>
        </div>

        {/* // Brands partner  */}
        <div className='py-10 h-screen' id='partners'>
          <div className='text-6xl font font-extrabold mb-8'>Our Green Allies</div>
          <div className='text-xl text-gray-500'>Sustainability isn't a solo act.</div>
          <div className='text-xl text-gray-500'>Our partners fuel your efforts with rewards, resources, and recognition for every action you take.</div>
          <div className='overflow-hidden h-[80%] my-5'>
            <img src="brand.png" alt="" className='w-full h-full object-cover object-[center_40%]' />
          </div>
        </div>

        {/* call to action  */}
        <div className='pt-20'>
          <div className='text-9xl text-left   font-extrabold pl-10 bg-green-400 text-white'>Get Your Green ID Now</div>
        </div>
 
        {/* footer  */}

        <div className='bg-[#000017] z-10 relative rounded-2xl h-[65vh]'>
          {/* <div className='flex flex-col border rounded-xl absolute bottom-10 left-10 px-6 py-2'>
            <div className='text-left '>Follow Us </div>
            <div className='flex justify-center items-center h-10 gap-2'>
                <div><FaSquareInstagram className='text-3xl'/></div>
                <div><FaSquareXTwitter className='text-3xl'/></div>
                <div><FaGithub className='text-3xl'/></div>
                <div><FaLinkedin className='text-3xl hover:text-blue-400'/></div>
            </div>
          </div> */}
          <div className='flex justify-between'>
            <div className='w-[48%] px-30 py-10'>
              <div className='text-[#766eb6] text-start  text-md mb-2'>GET IN TOUCH </div>
              <div className='text-5xl text-start'>Let's Discuss Your Vision. With Us</div>
              <div className='flex items-center text-md bg-white w-[60%] mt-10 px-10 py-4 hover:bg-[#766eb68a] hover:text-white transition-all duration-500 ease-in-out rounded-4xl text-black justify-between'>
                <h3>Message us now </h3> 
                <FaArrowRight/>
              </div>
              <div className='text-[#766eb6] text-start text-md mb-2 pt-8'>OR EMAIL US AT</div>
              <div className='flex border-2 border-dashed border-[#766eb6] items-center text-md text-white bg-[#18182F] w-[60%] mt-4 px-10 py-4 hover:bg-[#766eb68a] hover:text-white transition-all duration-500 ease-in-out rounded-4xl  justify-between'>
                <h3>admin@greenid.ac.in</h3> 
              </div>
            </div>

            <div className='flex flex-col gap-14' >
              <div className='w-[40] px-40 flex gap-40'>
                <div className='flex flex-col gap-2'>
                  <div className='text-[#766eb6] text-start text-md mb-2 pt-8'>QUICK LINKS</div>
                  <div className='text-left text-md flex flex-col gap-3 text-gray-400'>
                    <div><a href="#home">Home</a></div>
                    <div><a href="#howItWorks">How It Works ?</a></div>
                    <div><a href="#testimonials">Testimonials</a></div>
                    <div>Case Studies</div>
                    <div>About Us</div>
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <div className='text-[#766eb6] text-start text-md mb-2 pt-8'>INFORMATION</div>
                  <div className='text-left text-md flex flex-col gap-3 text-gray-400'>
                    <div>Term of Service</div>
                    <div>Privacy Policy</div>
                    <div>Cookies Settings</div>
                  </div>
                </div>
              </div>
              <div>
                <div className='px-40 flex flex-col gap-3'>
                  <div className='text-start text-md text-[#766eb6]'>FOLLOW US </div>
                  <div className='flex text-left items-center h-10 gap-8 text-gray-400 transition-all duration-500 ease-in-out'>
                    <div><FaSquareInstagram className='text-2xl hover:text-white'/></div>
                    <div><FaSquareXTwitter className='text-2xl hover:text-white'/></div>
                    <div><FaGithub className='text-2xl hover:text-white'/></div>
                    <div><FaLinkedin className='text-2xl hover:text-blue-400'/></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          


          <div className='absolute bottom-0 m-auto text-center w-full p-2 text-gray-600'> Made with ❤️ | 2025 © Green ID - All Rights Reserved</div>
        </div>

      </div>
      {/* No Future Without Nature */}
    </div>
    
  )
}

export default LandingPage
