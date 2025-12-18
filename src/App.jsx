
import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import christmasSong from './Mariah Carey - Oh Santa_ Official Lyric Video ft Ariana Grande Jennifer Hudson.mp3';

export default function PulsatingHeart() {
  const [welcomeScreen, setWelcomeScreen] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [firstClickTime, setFirstClickTime] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showInappropriateMsg, setShowInappropriateMsg] = useState(false);
  const [lastMouseY, setLastMouseY] = useState(0);
  const [verticalMoveCount, setVerticalMoveCount] = useState(0);
  const [showFinalButton, setShowFinalButton] = useState(false);
  const [finalReveal, setFinalReveal] = useState(false);
  const [firstMouseMove, setFirstMouseMove] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [showThermometer, setShowThermometer] = useState(false);
  const [temperature, setTemperature] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showThermometerButton, setShowThermometerButton] = useState(false);
  const [thermometerRevealed, setThermometerRevealed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const lastYRef = useRef(null);
  const lastXRef = useRef(null);
  const verticalMoveCountRef = useRef(0);
  const pointerTargetRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  });
  const rafIdRef = useRef(null);
  const lastFrameRef = useRef(null);
  const finalSongRef = useRef(null);



  useEffect(() => {
    if (firstClickTime && !showButton) {
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [firstClickTime, showButton]);

  useEffect(() => {
    if (firstMouseMove && !showFinalButton) {
      const timer = setTimeout(() => {
        setShowFinalButton(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [firstMouseMove, showFinalButton]);

  // useEffect(() => {
  //   if (revealed && !finalReveal) {
  //     const handleMouseMove = (e) => {
  //       if (!firstMouseMove) {
  //         setFirstMouseMove(true);
  //       }
        
  //       setMousePos({ x: e.clientX, y: e.clientY });
        
  //       const yDiff = Math.abs(e.clientY - lastMouseY);
  //       const xDiff = Math.abs(e.clientX - mousePos.x);
        
  //       if (yDiff > xDiff && yDiff > 20) {
  //         setVerticalMoveCount(prev => prev + 1);
          
  //         if (verticalMoveCount > 3) {
  //           setShowInappropriateMsg(true);
  //           setTimeout(() => {
  //             setShowInappropriateMsg(false);
  //           }, 5000);
  //         }
  //       }
        
  //       setLastMouseY(e.clientY);
  //     };

  //     window.addEventListener('mousemove', handleMouseMove);
      
  //     return () => {
  //       window.removeEventListener('mousemove', handleMouseMove);
  //     };
  //   }
  // }, [revealed, lastMouseY, verticalMoveCount, mousePos.x, finalReveal, firstMouseMove]);


  useEffect(() => {
    if (revealed && !finalReveal) {
      const handleMove = (e) => {
        // stop page scrolling while tracking
        if (e.cancelable) e.preventDefault();

        if (!firstMouseMove) setFirstMouseMove(true);

        const x = e.clientX ?? (e.touches?.[0]?.clientX);
        const y = e.clientY ?? (e.touches?.[0]?.clientY);
        if (typeof x !== 'number' || typeof y !== 'number') return;

        pointerTargetRef.current = { x, y };

        // --- "inappropriate" vertical movement detection ---
        const lastY = lastYRef.current;
        const lastX = lastXRef.current;

        if (lastY !== null && lastX !== null) {
          const yDiff = Math.abs(y - lastY);
          const xDiff = Math.abs(x - lastX);

          if (yDiff > xDiff && yDiff > 20) {
            verticalMoveCountRef.current += 1;

            if (verticalMoveCountRef.current > 3) {
              setShowInappropriateMsg(true);

              // reset so it can trigger again later if you want
              verticalMoveCountRef.current = 0;

              setTimeout(() => setShowInappropriateMsg(false), 2500);
            }
          }
        }

        lastYRef.current = y;
        lastXRef.current = x;
      };

      window.addEventListener('pointermove', handleMove, { passive: false });

      return () => {
        window.removeEventListener('pointermove', handleMove);
      };
    }
  }, [revealed, finalReveal, firstMouseMove]);

  useEffect(() => {
    if (!(revealed && !finalReveal)) return;

    // jump to wherever the target currently is so there's no initial snap
    setMousePos(pointerTargetRef.current);

    const tick = (time) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = time;
      }

      const dt = Math.min(64, time - lastFrameRef.current); // clamp to avoid giant steps
      lastFrameRef.current = time;

      setMousePos(prev => {
        const { x: targetX, y: targetY } = pointerTargetRef.current;
        const dx = targetX - prev.x;
        const dy = targetY - prev.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 0.01) return prev;

        // time-based max speed with a small catch-up factor so it remains smooth but responsive
        const dtSec = dt / 1000;
        const maxSpeed = 1800; // px per second
        const catchup = 0.08;  // fraction of remaining distance to add per frame

        const step = Math.min(dist, maxSpeed * dtSec + dist * catchup);
        const ratio = step / dist;

        const nextX = prev.x + dx * ratio;
        const nextY = prev.y + dy * ratio;
        return { x: nextX, y: nextY };
      });

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lastFrameRef.current = null;
    };
  }, [revealed, finalReveal]);

  useEffect(() => {
    // Play/stop the Christmas song on the final message screen
    if (showFinalMessage) {
      const audio = new Audio(christmasSong);
      audio.loop = true;
      audio.volume = isMuted ? 0 : 0.35;
      finalSongRef.current = audio;

      audio.play().catch(() => {
        // ignore autoplay failures; user interaction usually allows it
      });

      return () => {
        audio.pause();
        audio.currentTime = 0;
        finalSongRef.current = null;
      };
    }

    // stop if we leave the final screen
    if (finalSongRef.current) {
      finalSongRef.current.pause();
      finalSongRef.current.currentTime = 0;
      finalSongRef.current = null;
    }
  }, [showFinalMessage, isMuted]);

  useEffect(() => {
    if (finalSongRef.current) {
      finalSongRef.current.muted = isMuted;
      finalSongRef.current.volume = isMuted ? 0 : 0.35;
    }
  }, [isMuted]);


  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => {
      setWelcomeScreen(false);
    }, 1000);
  };

  const handleHeartClick = () => {
    if (!revealed && !showButton) {
      if (clicks === 0) {
        setFirstClickTime(Date.now());
      }
      
      const newClickCount = clicks + 1;
      setClicks(newClickCount);
      
      const heart = document.querySelector('.heart-container');
      if (heart) {
        const currentScale = 1 + newClickCount * 0.08;
        heart.style.animation = 'none';
        heart.style.transform = `scale(${currentScale})`;
        setTimeout(() => {
          heart.style.animation = `pulsateFrom${currentScale} 0.6s ease-in-out`;
          heart.style.setProperty('--current-scale', currentScale);
        }, 10);
      }
    }
  };

  const handleReveal = () => {
    const heart = document.querySelector('.heart-container');
    if (heart) {
      heart.style.animation = 'pulsateAndExpand 2.5s ease-in-out forwards';
    }
    setTimeout(() => {
      setRevealed(true);
    }, 2300);
  };

  const handleFinalReveal = () => {
    setFinalReveal(true);
    setTimeout(() => {
      setShowThermometer(true);
    }, 2000);
  };

  const getEyePosition = (eyeX, eyeY) => {
    const angle = Math.atan2(mousePos.y - eyeY, mousePos.x - eyeX);
    const distance = Math.min(15, Math.hypot(mousePos.x - eyeX, mousePos.y - eyeY) / 20);
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  const handleThermometerDrag = (e) => {
    if (isDragging) {
      const thermometer = document.querySelector('.thermometer-container');
      if (thermometer) {
        const rect = thermometer.getBoundingClientRect();
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const y = clientY - rect.top;
        const rawPercent = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
        const maxCap = thermometerRevealed ? 100 : 75;
        const target = Math.min(rawPercent, maxCap);
        // Ease toward the target so the fill doesn't jump too fast
        setTemperature((prev) => prev + (target - prev) * 0.3);
      }
    }
  };

  const handleThermometerMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    if (!showThermometerButton) {
      setTimeout(() => {
        setShowThermometerButton(true);
      }, 1000);
    }
  };

  const handleThermometerMouseUp = () => {
    setIsDragging(false);
  };

  const handleThermometerReveal = () => {
    setThermometerRevealed(true);
    setTimeout(() => {
      setTemperature(100);
    }, 500);
    setTimeout(() => {
      setShowFinalMessage(true);
    }, 4000);
  };

  const handleReplay = () => {
    if (finalSongRef.current) {
      finalSongRef.current.pause();
      finalSongRef.current.currentTime = 0;
      finalSongRef.current = null;
    }

    setWelcomeScreen(true);
    setUnlocking(false);
    setShowButton(false);
    setRevealed(false);
    setClicks(0);
    setFirstClickTime(null);
    setShowInappropriateMsg(false);
    setLastMouseY(0);
    setVerticalMoveCount(0);
    setShowFinalButton(false);
    setFinalReveal(false);
    setFirstMouseMove(false);
    setShowFinalMessage(false);
    setShowThermometer(false);
    setTemperature(50);
    setIsDragging(false);
    setShowThermometerButton(false);
    setThermometerRevealed(false);
    setIsMuted(false);
    setMousePos({ x: 0, y: 0 });
    pointerTargetRef.current = {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
    };
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleThermometerDrag);
      window.addEventListener('mouseup', handleThermometerMouseUp);
      window.addEventListener('touchmove', handleThermometerDrag);
      window.addEventListener('touchend', handleThermometerMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleThermometerDrag);
        window.removeEventListener('mouseup', handleThermometerMouseUp);
        window.removeEventListener('touchmove', handleThermometerDrag);
        window.removeEventListener('touchend', handleThermometerMouseUp);
      };
    }
  }, [isDragging]);

  if (welcomeScreen) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-red-400 via-pink-400 to-rose-400 flex flex-col items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <Heart className="absolute top-10 left-10 w-12 h-12 text-red-300 fill-red-300 opacity-50 animate-float" />
          <Heart className="absolute top-20 right-20 w-16 h-16 text-pink-300 fill-pink-300 opacity-40 animate-float-delayed" />
          <Heart className="absolute bottom-32 left-1/4 w-10 h-10 text-rose-300 fill-rose-300 opacity-60 animate-float" />
          <Heart className="absolute bottom-20 right-1/3 w-14 h-14 text-red-300 fill-red-300 opacity-50 animate-float-delayed" />
          <Heart className="absolute top-1/3 right-10 w-8 h-8 text-pink-300 fill-pink-300 opacity-70 animate-float" />
          <Heart className="absolute top-1/2 left-20 w-12 h-12 text-rose-400 fill-rose-400 opacity-60 animate-float-delayed" />
          <Heart className="absolute bottom-1/2 right-1/4 w-10 h-10 text-red-400 fill-red-400 opacity-50 animate-float" />
          <Heart className="absolute top-1/4 left-1/3 w-14 h-14 text-pink-400 fill-pink-400 opacity-40 animate-float-delayed" />
        </div>
        
        <div className="z-10 flex flex-col items-center gap-8 animate-fadeIn">
          <div className="relative mb-4">
            <Heart className="w-32 h-32 text-white fill-white opacity-80 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              {/* <span className="text-6xl">😈</span> */}
            </div>
          </div>
          
          <h1 className="text-white text-6xl md:text-7xl font-bold text-center px-4">
            Heyy Angyyy 😈
          </h1>
          <p className="text-white text-2xl md:text-3xl font-semibold italic">
            Welcome to my world
          </p>
          
          <button
            onClick={handleUnlock}
            className="mt-8 relative group"
          >
            <div className={`flex items-center gap-4 transition-all duration-700 ${unlocking ? 'unlock-animation' : ''}`}>
              <div className="handcuff-left bg-gray-700 rounded-full w-20 h-24 border-4 border-gray-800 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <div className="w-12 h-16 border-4 border-gray-400 rounded-full"></div>
              </div>
              <div className="handcuff-chain flex gap-1">
                <div className="w-3 h-8 bg-gray-600 rounded"></div>
                <div className="w-3 h-8 bg-gray-600 rounded"></div>
                <div className="w-3 h-8 bg-gray-600 rounded"></div>
              </div>
              <div className="handcuff-right bg-gray-700 rounded-full w-20 h-24 border-4 border-gray-800 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <div className="w-12 h-16 border-4 border-gray-400 rounded-full"></div>
              </div>
            </div>
            {!unlocking && (
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Click to unlock
              </div>
            )}
          </button>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(10deg);
            }
          }

          @keyframes float-delayed {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-25px) rotate(-10deg);
            }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .animate-float-delayed {
            animation: float-delayed 4s ease-in-out infinite;
          }

          .unlock-animation .handcuff-left {
            animation: unlockLeft 0.7s ease-out forwards;
          }

          .unlock-animation .handcuff-right {
            animation: unlockRight 0.7s ease-out forwards;
          }

          .unlock-animation .handcuff-chain {
            animation: fadeOut 0.5s ease-out forwards;
          }

          @keyframes unlockLeft {
            0% {
              transform: translateX(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateX(-100px) rotate(-90deg);
              opacity: 0;
            }
          }

          @keyframes unlockRight {
            0% {
              transform: translateX(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateX(100px) rotate(90deg);
              opacity: 0;
            }
          }

          @keyframes fadeOut {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
      {!revealed && (
        <p className="absolute top-1/4 md:top-1/3 text-gray-700 text-xl md:text-2xl font-semibold italic animate-fadeIn z-10 px-4 text-center">
          How my heart feels when I see you
        </p>
      )}
      
      <div
        onClick={handleHeartClick}
        className={`heart-container cursor-pointer transition-all duration-300`}
        style={{
          transform: `scale(${1 + clicks * 0.08})`
        }}
      >
        <Heart
          className="w-24 h-24 md:w-32 md:h-32 text-red-500 fill-red-500 transition-all duration-1000"
          strokeWidth={1.5}
        />
      </div>

      {showButton && !revealed && (
        <div className="absolute bottom-20 flex flex-col items-center gap-4 px-4">
          <button
            onClick={handleReveal}
            className="px-6 md:px-8 py-3 md:py-4 bg-white text-red-600 font-bold text-base md:text-lg rounded-full shadow-2xl hover:bg-red-50 hover:scale-105 transition-all duration-300 animate-fadeIn border-2 border-red-300"
          >
            Reveal the Truth
          </button>
        </div>
      )}

      {revealed && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 animate-bgFadeIn sparkle-bg">
          {showFinalMessage ? (
            <div className="flex flex-col items-center justify-center px-8 animate-fadeIn-slow relative">
              <div className="absolute inset-0 overflow-hidden">
                <Heart className="absolute top-10 left-10 w-16 h-16 text-pink-200 fill-pink-200 opacity-60 animate-float glow-heart" />
                <Heart className="absolute top-1/4 right-20 w-20 h-20 text-red-200 fill-red-200 opacity-50 animate-float-delayed glow-heart" />
                <Heart className="absolute bottom-32 left-1/4 w-14 h-14 text-rose-200 fill-rose-200 opacity-70 animate-float glow-heart" />
                <Heart className="absolute bottom-20 right-1/3 w-18 h-18 text-pink-300 fill-pink-300 opacity-60 animate-float-delayed glow-heart" />
                <Heart className="absolute top-1/3 right-10 w-12 h-12 text-red-200 fill-red-200 opacity-80 animate-float glow-heart" />
                <Heart className="absolute top-1/2 left-20 w-16 h-16 text-rose-300 fill-rose-300 opacity-70 animate-float-delayed glow-heart" />
                <Heart className="absolute bottom-1/2 right-1/4 w-14 h-14 text-pink-200 fill-pink-200 opacity-60 animate-float glow-heart" />
                <Heart className="absolute top-1/4 left-1/3 w-18 h-18 text-red-300 fill-red-300 opacity-50 animate-float-delayed glow-heart" />
                <Heart className="absolute bottom-1/4 left-1/2 w-12 h-12 text-rose-200 fill-rose-200 opacity-70 animate-float glow-heart" />
                <Heart className="absolute top-2/3 right-1/2 w-16 h-16 text-pink-300 fill-pink-300 opacity-60 animate-float-delayed glow-heart" />
              </div>
              <div className="glitter-layer" aria-hidden="true"></div>

              <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col items-end gap-2 md:flex-row md:items-center z-30">
                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  className="px-4 py-2 bg-white/90 text-red-600 font-semibold rounded-full shadow-lg border border-white/70 hover:bg-white transition"
                >
                  {isMuted ? 'Unmute Music' : 'Mute Music'}
                </button>
                <button
                  onClick={handleReplay}
                  className="px-4 py-2 bg-white/90 text-red-600 font-semibold rounded-full shadow-lg border border-white/70 hover:bg-white transition"
                >
                  Replay
                </button>
              </div>

              
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl p-12 max-w-3xl shadow-2xl border-4 border-white border-opacity-30 relative z-10">
                <div className="flex justify-center mb-6">
                  <Heart className="w-16 h-16 text-pink-200 fill-pink-200 animate-pulse glow-heart" />
                </div>
                <p className="text-white text-2xl md:text-3xl font-bold text-center mb-8">
                  Merry Christmas my Angy
                </p>
                <p className="text-white text-lg md:text-2xl text-center leading-relaxed mb-6">
                  I really have enjoyed all the memories we have shared together.
                </p>
                <p className="text-white text-lg md:text-2xl text-center leading-relaxed mb-8">
                  Bless we have many more to share together.
                </p>
                <p className="text-white text-xl md:text-2xl font-semibold text-center italic">
                  Love,
                </p>
                <p className="text-white text-xl md:text-2xl font-semibold text-center italic">
                  Your Roro
                </p>
                <div className="flex justify-center gap-8 mt-8">
                  <Heart className="w-8 h-8 text-pink-200 fill-pink-200 animate-pulse glow-heart" />
                  <Heart className="w-8 h-8 text-pink-200 fill-pink-200 animate-pulse glow-heart" style={{animationDelay: '0.2s'}} />
                  <Heart className="w-8 h-8 text-pink-200 fill-pink-200 animate-pulse glow-heart" style={{animationDelay: '0.4s'}} />
                </div>
              </div>
            </div>
          ) : showThermometer ? (
            <div
              className={`flex flex-col items-center gap-8 animate-fadeIn relative w-full h-full ${
                thermometerRevealed ? 'justify-start pt-10 pb-6' : 'justify-center'
              }`}
            >
              {thermometerRevealed && temperature >= 95 && (
                <>
                  <div className="absolute inset-0 animate-fire-burst pointer-events-none">
                    <div className="fire-particle fire-1"></div>
                    <div className="fire-particle fire-2"></div>
                    <div className="fire-particle fire-3"></div>
                    <div className="fire-particle fire-4"></div>
                    <div className="fire-particle fire-5"></div>
                    <div className="fire-particle fire-6"></div>
                    <div className="fire-particle fire-7"></div>
                    <div className="fire-particle fire-8"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-red-500 to-transparent opacity-50 animate-pulse-fast pointer-events-none"></div>
                </>
              )}
              
              <p className="text-white text-3xl md:text-4xl font-bold text-center mb-4 z-10 px-4">
                How hot I think you are 🔥
              </p>
              
              <div className={`relative flex flex-col items-center z-10 ${thermometerRevealed ? 'mt-2' : ''}`}>
                <div 
                  className={`thermometer-container relative bg-white rounded-full shadow-2xl transition-all duration-1000 ${
                    thermometerRevealed ? 'h-[500px]' : 'h-80'
                  } w-20 md:w-24 overflow-hidden touch-none`}
                  onMouseDown={handleThermometerMouseDown}
                  onTouchStart={handleThermometerMouseDown}
                >
                  <div 
                    className={`absolute bottom-0 left-0 right-0 rounded-full transition-all ${
                      thermometerRevealed ? 'bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 duration-700' : 'bg-gradient-to-t from-red-600 to-orange-400 duration-300'
                    }`}
                    style={{ 
                      height: thermometerRevealed ? `${temperature}%` : `${(temperature / 75) * 100}%`,
                      transition: isDragging ? 'none' : undefined
                    }}
                  ></div>
                  
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-gray-800 font-bold text-sm">
                    {thermometerRevealed ? '100°' : '75°'}
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 font-bold text-sm">
                    {thermometerRevealed ? '50°' : '37°'}
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-800 font-bold text-sm">
                    0°
                  </div>
                  
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white shadow-lg cursor-grab active:cursor-grabbing z-10 ${
                      thermometerRevealed ? 'bg-yellow-400 animate-pulse-fast' : 'bg-red-700'
                    }`}
                    style={{ 
                      bottom: thermometerRevealed 
                        ? `calc(${(temperature / 100) * 100}% - 16px)` 
                        : `calc(${(temperature / 75) * 100}% - 16px)`,
                      transition: isDragging ? 'none' : 'all 0.7s'
                    }}
                  ></div>
                </div>
                
                <div className="mt-4 w-32 h-32 bg-red-600 rounded-full border-8 border-white shadow-2xl"></div>
                
                <p className="text-white text-3xl font-bold mt-6">
                  {Math.round(temperature)}°
                </p>
              </div>
              
              <div className="mt-4 h-16 flex items-center justify-center">
                <button
                  onClick={handleThermometerReveal}
                  className={`px-6 md:px-8 py-3 md:py-4 bg-white text-red-600 font-bold text-base md:text-lg rounded-full shadow-2xl border-2 border-red-300 transition-all duration-300
                    ${showThermometerButton && !thermometerRevealed
                      ? 'opacity-100 translate-y-0 hover:bg-red-50 hover:scale-105'
                      : 'opacity-0 -translate-y-2 pointer-events-none'}
                  `}
                >
                  Reveal the Truth
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="absolute top-20 text-white text-2xl md:text-3xl font-bold italic animate-fadeIn px-4 text-center">
                My eyes when I see you
              </p>
          
          <div className="absolute inset-0 flex items-center justify-center gap-32 animate-fadeIn touch-none"style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
            <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center">
              {!finalReveal ? (
                <div 
                  className="w-16 h-16 bg-black rounded-full transition-transform duration-100"
                  style={{
                    transform: `translate(${getEyePosition(window.innerWidth / 2 - 100, window.innerHeight / 2).x}px, ${getEyePosition(window.innerWidth / 2 - 100, window.innerHeight / 2).y}px)`
                  }}
                />
              ) : (
                <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-pulse" />
              )}
            </div>
            
            <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center">
              {!finalReveal ? (
                <div 
                  className="w-16 h-16 bg-black rounded-full transition-transform duration-100"
                  style={{
                    transform: `translate(${getEyePosition(window.innerWidth / 2 + 100, window.innerHeight / 2).x}px, ${getEyePosition(window.innerWidth / 2 + 100, window.innerHeight / 2).y}px)`
                  }}
                />
              ) : (
                <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-pulse" />
              )}
            </div>
          </div>
          
          {finalReveal && !showThermometer && (
            <div className="absolute bottom-1/3 w-48 h-24 border-8 border-white rounded-b-full animate-fadeIn" style={{borderTop: 'none'}}></div>
          )}
          
          {showInappropriateMsg && !showThermometer && (
            <div className="absolute top-20 bg-white px-8 py-4 rounded-lg shadow-2xl animate-fadeIn">
              <p className="text-red-600 text-2xl font-bold">Stop being inappropriate! 😳</p>
            </div>
          )}
          
          {showFinalButton && !showThermometer && !showFinalMessage && (
            <button
              onClick={handleFinalReveal}
              className="absolute bottom-20 px-8 py-4 bg-white text-red-600 font-bold text-lg rounded-full shadow-2xl hover:bg-red-50 hover:scale-105 transition-all duration-300 animate-fadeIn border-2 border-red-300 z-20"
            >
              Reveal the Truth
            </button>
          )}
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .heart-container {
          --current-scale: 1;
        }

        @keyframes pulsate {
          0% {
            transform: scale(var(--current-scale));
          }
          50% {
            transform: scale(calc(var(--current-scale) * 1.15));
          }
          100% {
            transform: scale(var(--current-scale));
          }
        }

        @keyframes pulsateAndExpand {
          0% {
            transform: scale(var(--current-scale));
          }
          10% {
            transform: scale(calc(var(--current-scale) * 1.3));
          }
          20% {
            transform: scale(calc(var(--current-scale) * 1.1));
          }
          30% {
            transform: scale(calc(var(--current-scale) * 1.4));
          }
          40% {
            transform: scale(calc(var(--current-scale) * 1.2));
          }
          50% {
            transform: scale(calc(var(--current-scale) * 1.6));
          }
          60% {
            transform: scale(calc(var(--current-scale) * 1.4));
          }
          70% {
            transform: scale(calc(var(--current-scale) * 2));
          }
          80% {
            transform: scale(calc(var(--current-scale) * 3));
          }
          90% {
            transform: scale(calc(var(--current-scale) * 5));
          }
          100% {
            transform: scale(20);
          }
        }

        @keyframes expandHeart {
          0% {
            transform: scale(var(--current-scale));
          }
          100% {
            transform: scale(20);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bgFadeIn {
          from {
            background-color: rgba(239, 68, 68, 0);
          }
          to {
            background-color: rgba(239, 68, 68, 0.95);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }

        .animate-bgFadeIn {
          animation: bgFadeIn 0.8s ease-in forwards;
        }

        .fire-particle {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          opacity: 0;
        }

        .fire-1 {
          background: radial-gradient(circle, #ff6b00, #ff0000);
          top: 50%;
          left: 30%;
          animation: fireFloat1 2s ease-out forwards;
        }

        .fire-2 {
          background: radial-gradient(circle, #ffd700, #ff6b00);
          top: 60%;
          right: 30%;
          animation: fireFloat2 2.2s ease-out forwards;
        }

        .fire-3 {
          background: radial-gradient(circle, #ff4500, #ff0000);
          top: 40%;
          left: 50%;
          animation: fireFloat3 1.8s ease-out forwards;
        }

        .fire-4 {
          background: radial-gradient(circle, #ffd700, #ff8c00);
          top: 70%;
          left: 40%;
          animation: fireFloat1 2.5s ease-out forwards;
        }

        .fire-5 {
          background: radial-gradient(circle, #ff6b00, #ff0000);
          top: 30%;
          right: 40%;
          animation: fireFloat2 2.3s ease-out forwards;
        }

        .fire-6 {
          background: radial-gradient(circle, #ffd700, #ff4500);
          bottom: 40%;
          left: 25%;
          animation: fireFloat3 2.1s ease-out forwards;
        }

        .fire-7 {
          background: radial-gradient(circle, #ff8c00, #ff0000);
          bottom: 30%;
          right: 25%;
          animation: fireFloat1 2.4s ease-out forwards;
        }

        .fire-8 {
          background: radial-gradient(circle, #ffd700, #ff6b00);
          top: 50%;
          right: 50%;
          animation: fireFloat2 2s ease-out forwards;
        }

        @keyframes fireFloat1 {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(0, -200px) scale(2);
            opacity: 0;
          }
        }

        @keyframes fireFloat2 {
          0% {
            transform: translate(0, 0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(100px, -150px) scale(1.8) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes fireFloat3 {
          0% {
            transform: translate(0, 0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(-100px, -180px) scale(2.2) rotate(-180deg);
            opacity: 0;
          }
        }

        @keyframes pulse-fast {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-pulse-fast {
          animation: pulse-fast 0.5s ease-in-out infinite;
        }
      /* ===== Final reveal animation ===== */
      @keyframes finalReveal {
        0% {
          opacity: 0;
          transform: translateY(18px) scale(0.98);
          filter: blur(6px);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      .animate-fadeIn-slow {
        animation: finalReveal 1.2s ease-out forwards;
      }

      /* ===== Glitter overlay ===== */
      .glitter-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
        opacity: 0.6;
        mix-blend-mode: screen;
        background:
          radial-gradient(circle at 10% 20%, rgba(255,255,255,0.9) 0 1px, transparent 2px),
          radial-gradient(circle at 30% 70%, rgba(255,255,255,0.8) 0 1px, transparent 2px),
          radial-gradient(circle at 60% 40%, rgba(255,255,255,0.7) 0 1px, transparent 2px),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.9) 0 1px, transparent 2px),
          radial-gradient(circle at 90% 80%, rgba(255,255,255,0.8) 0 1px, transparent 2px);
        animation: glitterDrift 6s ease-in-out infinite,
                  glitterTwinkle 1.6s ease-in-out infinite;
      }

      @keyframes glitterDrift {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(-12px, -18px, 0); }
      }

      @keyframes glitterTwinkle {
        0%, 100% { opacity: 0.35; filter: blur(0); }
        50% { opacity: 0.75; filter: blur(0.6px); }
      }

      /* ===== Sparkly background (final screen) ===== */
      .sparkle-bg {
        background-color: #ef4444; /* tailwind red-500 */
        background-image:
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0 10px, transparent 14px),
          radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12) 0 8px, transparent 12px),
          radial-gradient(circle at 40% 70%, rgba(255,255,255,0.16) 0 9px, transparent 13px),
          radial-gradient(circle at 70% 80%, rgba(255,255,255,0.14) 0 11px, transparent 15px),
          radial-gradient(circle at 55% 40%, rgba(255,255,255,0.2) 0 6px, transparent 10px);
        background-size: 280px 280px, 320px 320px, 260px 260px, 340px 340px, 300px 300px;
        animation: sparkleDrift 12s ease-in-out infinite alternate;
      }

      @keyframes sparkleDrift {
        0% { background-position: 0 0, 50px 20px, -40px 80px, 30px -30px, 10px 40px; }
        100% { background-position: -40px 40px, -20px 60px, 30px 10px, -50px 50px, 60px -20px; }
      }

      `}</style>
    </div>
  );
}
