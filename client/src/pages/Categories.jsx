import React from "react";
import { Link } from "react-router-dom";
import CultureImg from "../assets/Culture.jpg";
import BusinessImg from "../assets/business.png";
import EducationImg from "../assets/Education.png";
import HealthImg from "../assets/Health.png";
import NewsImg from "../assets/News.png";
import ComedyImg from "../assets/comedy.png";
import TechnologyImg from "../assets/Technology.png";
import TravelImg from "../assets/Travel.png";
import LoveImg from "../assets/LoveImg.jpg"

const Categories = () => {
    const cat = [
        {
            name: "Culture",
            img: CultureImg,
            color: "#e8562a",
            to: "/categories/Culture",
        },
        {
            name: "Business",
            img: BusinessImg,
            color: "#c9b2ab",
            to: "/categories/Business",
        },
        {
            name: "Education",
            img: EducationImg,
            color: "#8cabaa",
            to: "/categories/Education",
        },
        {
            name: "Health",
            img: HealthImg,
            color: "#62bf62",
            to: "/categories/Health",
        },
        {
            name: "News",
            img: NewsImg,
            color: "#4a90e2",
            to: "/categories/News",
        },
        {
            name: "Comedy",
            img: ComedyImg,
            color: "#f5a623",
            to: "/categories/Comedy",
        },
        {
            name: "Technology",
            img: TechnologyImg,
            color: "#9b59b6",
            to: "/categories/Technology",
        },
        {
            name: "Travel",
            img: TravelImg,
            color: "#e67e22",
            to: "/categories/Travel",
        },
        {
            name: "Love",
            img: LoveImg,
            color: "rgba(255, 0, 0, 0.5)",
            to: "/categories/Love",
        },
    ];

    return (
        <div className="h-screen lg:h-[78vh]">
            <div className="px-4 lg:px-12 py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cat.map((item, i) => (
                    <Link
                        to={item.to}
                        key={i}
                        className="rounded px-8 py-4 text-xl font-semibold hover:scale-105 shadow-xl transition-all duration-300 relative h-[22vh] overflow-hidden"
                        style={{ backgroundColor: item.color }}
                    >
                        <div>{item.name}</div>
                        <div className="w-full flex items-center justify-end absolute -bottom-2 -right-2">
                            <img
                                src={item.img}
                                alt={`Image for ${item.name} category`}
                                className="rounded rotate-12 h-[15vh] md:h-[17vh] lg:h-[18vh] max-w-[80%] sm:max-w-[60%]"
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;
