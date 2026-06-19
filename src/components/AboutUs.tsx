import { MapPin, Award, Users, Globe } from "lucide-react";
import Logo from "@/assets/lanka-vacation-official-logo.png";

const AboutUs = () => {
  return (
    <section
      className="
        py-20
        bg-gradient-to-br
        from-primary/5 to-accent/5
        dark:from-primary/20 dark:to-accent/20
      "
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-32 h-32 mx-auto mb-6">
              <img
                src={Logo}
                alt="Lanka Vacations Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4">
              Lanka Vacations (Pvt) Ltd.
            </h2>

            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-12">

            {/* About Text */}
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-muted-foreground dark:text-gray-300">
                Established in 1984, Lanka Vacations acts as a Destination
                Management company to meet every client need. We offer day
                excursions, cultural, nature & wildlife tours, as well as
                tailor-made itineraries.
              </p>

              <p className="text-lg leading-relaxed text-muted-foreground dark:text-gray-300">
                With over 40 years of experience, we pride ourselves on
                delivering authentic Sri Lankan experiences that create
                lasting memories for travelers from around the world.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">

              {/* Card */}
              <div
                className="
                  bg-white
                  dark:bg-background
                  rounded-xl p-6 text-center
                  shadow-lg shadow-black/10
                  hover:shadow-xl hover:shadow-black/15
                  transition-shadow duration-300
                  dark:shadow-none
                  border border-transparent dark:border-border
                "
              >
                <Award className="text-accent mx-auto mb-3" size={40} />
                <p className="text-3xl font-bold text-foreground dark:text-white mb-1">
                  40+
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Years Experience
                </p>
              </div>

              {/* Card */}
              <div
                className="
                  bg-white
                  dark:bg-background
                  rounded-xl p-6 text-center
                  shadow-lg shadow-black/10
                  hover:shadow-xl hover:shadow-black/15
                  transition-shadow duration-300
                  dark:shadow-none
                  border border-transparent dark:border-border
                "
              >
                <Users className="text-primary mx-auto mb-3" size={40} />
                <p className="text-3xl font-bold text-foreground dark:text-white mb-1">
                  2000+
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Happy Travelers
                </p>
              </div>

              {/* Card */}
              <div
                className="
                  bg-white
                  dark:bg-background
                  rounded-xl p-6 text-center
                  shadow-lg shadow-black/10
                  hover:shadow-xl hover:shadow-black/15
                  transition-shadow duration-300
                  dark:shadow-none
                  border border-transparent dark:border-border
                "
              >
                <Globe className="text-accent mx-auto mb-3" size={40} />
                <p className="text-3xl font-bold text-foreground dark:text-white mb-1">
                  50+
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Tour Packages
                </p>
              </div>

              {/* Card */}
              <div
                className="
                  bg-white
                  dark:bg-background
                  rounded-xl p-6 text-center
                  shadow-lg shadow-black/10
                  hover:shadow-xl hover:shadow-black/15
                  transition-shadow duration-300
                  dark:shadow-none
                  border border-transparent dark:border-border
                "
              >
                <MapPin className="text-primary mx-auto mb-3" size={40} />
                <p className="text-3xl font-bold text-foreground dark:text-white mb-1">
                  15+
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Destinations
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutUs;
