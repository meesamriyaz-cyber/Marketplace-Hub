"use client";
import * as React from "react";
import { Toaster as Sonner } from "sonner";
const Toaster = ({ ...props }) => {
    const [theme, setTheme] = React.useState("system");
    React.useEffect(() => {
        const root = document.documentElement;
        const isLight = root.classList.contains("light");
        const isDark = root.classList.contains("dark");
        if (isLight) setTheme("light");
        else if (isDark) setTheme("dark");
        else setTheme("system");
    }, []);
    return (React.createElement(Sonner, { theme: theme, className: "toaster group", toastOptions: {
            classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            },
        }, ...props }));
};
export { Toaster };
