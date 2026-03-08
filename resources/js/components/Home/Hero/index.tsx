import { Icon } from "@iconify/react";
import { getImagePrefix } from "@/utils/util";

const Hero = () => {
    return (
        <section
            id="home-section"
            className="bg-slateGray dark:bg-black transition-colors duration-300"
        >
            <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
                    {/* Left Content */}
                    <div className="col-span-6 flex flex-col gap-8">
                        {/* Discount badge */}
                        <div className="flex gap-2 mx-auto lg:mx-0 items-center">
                            <Icon
                                icon="solar:verified-check-bold"
                                className="text-success text-xl inline-block me-2"
                            />
                            <p className="text-success text-sm font-semibold text-center lg:text-start">
                                Get your first IELTS simulation
                            </p>
                        </div>

                        {/* Heading */}
                        <h1 className="text-midnight_text dark:text-white text-4xl sm:text-5xl font-semibold pt-5 lg:pt-0">
                            Practice IELTS on a real computer-based simulator.
                        </h1>

                        {/* Heading */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                            <h1 className="text-2xl md:text-4xl font-extrabold
                 bg-gradient-to-r from-red-500 to-blue-500
                 bg-clip-text text-transparent drop-shadow-lg">
                                All Writing Tasks Evaluated with AI
                            </h1>

                            <img
                                src={`${getImagePrefix()}images/banner/openai.png`}
                                alt="hero-banner"
                                width={220}
                                className="object-contain rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.3)]
               hover:scale-105 transition-transform duration-200 ease-in-out"
                            />
                        </div>


                        {/* Subheading */}
                        <h3 className="text-black/70 dark:text-gray-300 text-lg pt-5 lg:pt-0">
                            Experience the authentic IELTS test environment, improve
                            your skills, and track your progress before the real exam.
                        </h3>


                        {/* Features */}
                        <div className="flex items-center justify-between pt-10 lg:pt-4">
                            {[
                                "Real test interface",
                                "Instant results",
                                "Flexible practice"
                            ].map((text, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <img
                                        src={`${getImagePrefix()}images/banner/check-circle.svg`}
                                        alt="check-image"
                                        width={30}
                                        height={30}
                                        className="smallImage"
                                    />
                                    <p className="text-sm sm:text-lg font-normal text-black dark:text-white">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="col-span-6 flex justify-center">
                        <img
                            src={`${getImagePrefix()}images/banner/mahila.png`}
                            alt="hero-banner"
                            width={1000}
                            height={805}
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
