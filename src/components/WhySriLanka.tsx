import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import beachVideo from "@/assets/videos/vidpv.mp4";

const WhySriLanka = () => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
      <section id="explore" className="py-24 bg-background relative overflow-hidden">
        {/* Decorative Elements */}
        <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="container mx-auto px-4 relative" ref={ref}>
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Video Side */}
              <motion.div
                  className="relative order-2 lg:order-1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-elegant group">
                  {/* Video Player */}
                  <motion.div
                      className="w-full h-[600px] overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.7 }}
                  >
                    <video
                        ref={videoRef}
                        src={beachVideo}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnd}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </motion.div>

                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />

                  {/* Removed the entire floating card section */}
                </div>

                {/* Accent Circle */}
                <motion.div
                    className="absolute -top-8 -right-8 w-32 h-32 bg-accent/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              {/* Content Side */}
              <motion.div
                  className="order-1 lg:order-2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              >
                <motion.p
                    className="text-accent font-medium mb-4 tracking-widest text-sm uppercase"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Discover the Island
                </motion.p>

                <motion.h2
                    className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Why Sri Lanka?
                </motion.h2>

                <div className="space-y-6 mb-10">
                  {[
                    <>
                      <span className="text-foreground font-medium">"Ayubowan"</span> — in the language of the Sinhalese people,
                      means more than merely welcome; it means "May you live long." This ancient greeting embodies
                      the warmth that awaits you.
                    </>,
                    <>
                      Sri Lanka is an island of infinite variety. Set like a jewelled pendant in the Indian Ocean,
                      from shining coast to mist-covered mountains, this compact island nation offers experiences
                      that rival continents many times its size.
                    </>,
                    <>
                      From tropical, soft-sand beaches and warm, inviting seas to breathtaking mountain scenery,
                      tea-covered slopes, ancient cities, fabled mines of precious gems, and wildlife reserves
                      rich in unique, endemic species.
                    </>
                  ].map((text, idx) => (
                      <motion.p
                          key={idx}
                          className="text-lg text-muted-foreground leading-relaxed"
                          initial={{ opacity: 0, y: 20 }}
                          animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                      >
                        {text}
                      </motion.p>
                  ))}
                </div>

                {/* Removed the button section */}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default WhySriLanka;