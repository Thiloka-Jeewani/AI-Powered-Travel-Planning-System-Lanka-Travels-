import { ArrowRight } from "lucide-react";
import beachImage from "@/assets/beach-scene.jpg";
import templeImage from "@/assets/temple-heritage.jpg";
import teaImage from "@/assets/tea-plantations.jpg";

const destinations = [
  {
    name: "Pristine Beaches",
    description: "Golden sands and crystal-clear waters",
    image: beachImage,
    tag: "Relaxation"
  },
  {
    name: "Ancient Heritage",
    description: "UNESCO World Heritage sites",
    image: templeImage,
    tag: "Culture"
  },
  {
    name: "Hill Country",
    description: "Lush tea plantations and cool climate",
    image: teaImage,
    tag: "Adventure"
  },
];

const Destinations = () => {
  return (
    <section id="destinations" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium mb-4 tracking-widest text-sm uppercase">
            Explore More
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6">
            Top Destinations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From coastal paradises to mountain retreats, discover the diverse beauty of Sri Lanka
          </p>
        </div>

        {/* Destination Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {destinations.map((destination, idx) => (
            <div 
              key={idx}
              className="group relative h-[500px] rounded-3xl overflow-hidden shadow-elegant cursor-pointer hover-lift animate-fade-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Image */}
              <img 
                src={destination.image} 
                alt={destination.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Tag */}
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-full shadow-soft">
                  {destination.tag}
                </span>
              </div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="font-serif text-3xl font-bold text-primary-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                  {destination.name}
                </h3>
                <p className="text-primary-foreground/80 text-lg mb-4">
                  {destination.description}
                </p>
                
                {/* Hover CTA */}
                <div className="flex items-center gap-2 text-accent font-medium opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <span>Discover More</span>
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
