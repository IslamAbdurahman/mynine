import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

const Hero = () => {
    const { t } = useTranslation();
    return (
        <section
            id="home-section"
            className="relative overflow-hidden bg-white dark:bg-black transition-colors duration-500 pb-20 pt-10"
        >
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-16">
                    {/* Left Content */}
                    <div className="col-span-12 lg:col-span-7 flex flex-col gap-10">
                        <div className="space-y-6">
                            {/* Discount badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 animate-pulse">
                                <Icon
                                    icon="solar:verified-check-bold"
                                    className="text-success text-xl"
                                />
                                <p className="text-success text-sm font-bold tracking-tight">
                                    {t('landing.hero_badge')}
                                </p>
                            </div>

                            {/* Heading */}
                            <h1 className="text-midnight_text dark:text-white text-5xl sm:text-7xl font-extrabold leading-[1.1] tracking-tight">
                                {t('landing.hero_title')} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                                    {t('landing.hero_title_accent')}
                                </span>
                            </h1>

                            {/* Subheading */}
                            <h3 className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed max-w-2xl">
                                {t('landing.hero_subtitle')}
                            </h3>
                        </div>

                        {/* CTA / Action */}
                        <div className="flex flex-wrap items-center gap-6">
                            <a href="#tests" className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300">
                                {t('landing.start_free_test')}
                            </a>
                            <div className="flex items-center gap-5 px-8 py-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl backdrop-blur-md hover:border-primary/30 transition-colors duration-300 group">
                                <img
                                    src="/images/banner/openai.png"
                                    alt="AI Evaluation"
                                    width={160}
                                    className="opacity-90 group-hover:scale-105 transition-transform duration-300 rounded-lg"
                                />
                                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-tight">
                                    {t('landing.ai_evaluation')} <br /> {t('landing.ai_feedback')}
                                </span>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { text: t('landing.feature_real_interface'), icon: "solar:monitor-bold" },
                                { text: t('landing.feature_instant_result'), icon: "solar:graph-bold" },
                                { text: t('landing.feature_ai_writing'), icon: "solar:pen-new-square-bold" }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-center group">
                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-primary group-hover:scale-110 transition-transform duration-300">
                                        <Icon icon={item.icon} className="size-6" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="col-span-12 lg:col-span-5 flex justify-center relative">
                        <div className="relative z-10 w-full animate-float">
                            <img
                                src="/images/banner/mahila.png"
                                alt="IELTS Success"
                                width={800}
                                height={800}
                                className="object-contain w-full drop-shadow-[0_20px_50px_rgba(101,86,255,0.3)]"
                            />
                        </div>
                        {/* Decorative Background for Image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-purple-500/20 rounded-full blur-3xl -z-0 opacity-50 scale-125" />
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};

export default Hero;
