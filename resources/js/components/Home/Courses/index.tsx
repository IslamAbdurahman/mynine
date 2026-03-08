import React, { useEffect, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { Icon } from '@iconify/react';
import { Test } from '@/types';
import CreateAttemptModal from '@/components/attempt/create-attempt-modal';

const Courses: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([]);

    const [sliderRef] = useKeenSlider<HTMLDivElement>({
        loop: true,
        slides: { perView: 3, spacing: 20 },
        breakpoints: {
            '(max-width: 1200px)': { slides: { perView: 2, spacing: 15 } },
            '(max-width: 600px)': { slides: { perView: 1, spacing: 10 } },
        },
    });

    useEffect(() => {
        fetch(route('landing-page-tests'))
            .then(res => res.json())
            .then(res => setTests(res.data ?? res))
            .catch(err => console.error('getTest error:', err));
    }, []);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStars = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStars;

        return (
            <>
                {Array.from({ length: fullStars }, (_, i) => (
                    <Icon key={`full-${i}`} icon="tabler:star-filled" className="text-yellow-500 text-xl inline-block" />
                ))}
                {halfStars > 0 && (
                    <Icon key="half" icon="tabler:star-half-filled" className="text-yellow-500 text-xl inline-block" />
                )}
                {Array.from({ length: emptyStars }, (_, i) => (
                    <Icon key={`empty-${i}`} icon="tabler:star-filled" className="text-gray-400 dark:text-gray-600 text-xl inline-block" />
                ))}
            </>
        );
    };

    // fallback for 1-2 tests
    if (tests.length <= 2) {
        return (
            <div className="flex justify-center gap-6 flex-wrap">
                {tests.map(items => (
                    <div key={items.id} className="w-full sm:w-1/2 lg:w-1/3">
                        <div className="bg-white dark:bg-gray-900 m-3 px-3 pt-3 shadow-course-shadow dark:shadow-gray-800/50 rounded-2xl h-full">
                            <div className="relative rounded-3xl">
                                <img
                                    src={`/images/courses/coursethree.png`}
                                    alt="course"
                                    className="m-auto clipPath"
                                    width={389}
                                    height={262}
                                />
                                <div className="absolute right-5 -bottom-2 rounded-full">
                                    <CreateAttemptModal test={items} />
                                </div>
                            </div>
                            <div className="px-3 pt-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white max-w-[75%] inline-block">
                                    {items.folder.name} : {items.name}
                                </h3>


                                <div
                                    className="flex justify-between items-center py-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-4">{renderStars(5)}</div>
                                    <h3 className="text-3xl font-medium text-gray-900 dark:text-white">Free</h3>
                                </div>

                                <div className="flex justify-between pt-6">
                                    <div className="flex gap-2 items-center">
                                        <Icon icon="solar:notebook-minimalistic-outline"
                                              className="text-primary text-xl" />
                                        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">{items.types.length} steps</h3>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Icon icon="solar:users-group-rounded-linear"
                                              className="text-primary text-xl" />
                                        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">{items.attempts_count} students</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div ref={sliderRef} className="keen-slider">
            {tests.map(items => (
                <div key={items.id} className="keen-slider__slide">
                    <div
                        className="bg-white dark:bg-gray-900 m-3 px-3 pt-3 pb-12 shadow-course-shadow dark:shadow-gray-800/50 rounded-2xl h-full">
                        <div className="relative rounded-3xl">
                            <img
                                src={`/images/courses/coursethree.png`}
                                alt="course"
                                className="m-auto clipPath"
                                width={389}
                                height={262}
                            />
                            <div className="absolute right-5 -bottom-2 rounded-full">
                                <CreateAttemptModal test={items} />
                            </div>
                        </div>
                        <div className="px-3 pt-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white max-w-[75%] inline-block">
                            {items.folder.name} : {items.name}
                            </h3>

                            <div className="flex justify-between items-center py-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4">{renderStars(5)}</div>
                                <h3 className="text-3xl font-medium text-gray-900 dark:text-white">Free</h3>
                            </div>

                            <div className="flex justify-between pt-6">
                                <div className="flex gap-2 items-center">
                                    <Icon icon="solar:notebook-minimalistic-outline" className="text-primary text-xl" />
                                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">{items.types.length} steps</h3>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Icon icon="solar:users-group-rounded-linear" className="text-primary text-xl" />
                                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">{items.attempts_count} students</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Courses;
