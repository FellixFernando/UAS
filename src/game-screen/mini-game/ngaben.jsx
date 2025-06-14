import React, { useState, useEffect } from "react";
import bakar from '../../assets/image/ngaben.gif';


export default function Ngaben({ onChangeWorld }) {
    const [showGif, setShowGif] = useState(true);
    
    useEffect(() => {
        // Timer untuk menghentikan GIF setelah selesai (sesuaikan dengan durasi GIF)
        const timer = setTimeout(() => {
            setShowGif(false);
            // Setelah GIF selesai, kembali ke city map
            if (onChangeWorld) {
                onChangeWorld('city');
            }
        }, 5000); // Durasi 5 detik, sesuaikan dengan durasi GIF Anda

        return () => clearTimeout(timer);
    }, [onChangeWorld]);

    const gifStyle = {
        width: '100%',
        height: '100vh',
        objectFit: 'contain',
        display: showGif ? 'block' : 'none'
    };

    return (
        <div style={{ backgroundColor: '#000', width: '100%', height: '100vh' }}>
            <img 
                src={bakar} 
                alt="Ngaben Ceremony"
                style={gifStyle}
            />
        </div>
    );
}

