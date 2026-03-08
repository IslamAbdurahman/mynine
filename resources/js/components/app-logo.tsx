import React from 'react';


export default function AppLogo() {

    const domain =
        typeof window !== "undefined" ? window.location.hostname : "mynine.uz";

    // domenni capitalize qilish (faqat birinchi harflar katta)
    const capitalizeDomain = domain
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <>
            <h1 className={'text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'}>
                {capitalizeDomain}
            </h1>

            {/*<div*/}
            {/*    className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">*/}
            {/*    /!*<AppLogoIcon className="size-5 fill-current text-white dark:text-black" />*!/*/}
            {/*    <img*/}
            {/*        src="/logo.svg"*/}
            {/*        alt="App Logo"*/}
            {/*        className="size-9 fill-current text-white dark:text-black"*/}
            {/*    />*/}

            {/*</div>*/}

            {/*<div className="ml-1 grid flex-1 text-left text-sm">*/}
            {/*    <span className="mb-0.5 truncate leading-none font-semibold">IELTS</span>*/}
            {/*</div>*/}
        </>
    );
}
