"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("fd62a754-6161-4b0d-89d2-742ff73302d5");
    }, []);

    return null;
};