import React from "react";

const InputPodcast = () => {
    return (
        <div className="my-4 px-4 lg:px-12">
            <h1 className="text-2xl font-semibold">Create Your Podcast</h1>
            <div className="mt-5 flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="w-full lg:w-2/6 flex items-center justify-center lg:justify-start">
                    <div
                        className="h-40 w-40 lg:h-60 lg:w-60 flex items-center justify-center hover:bg-slate-50 transition-all duration-300 border-dashed border-2 border-black"
                    >
                        <input
                            type="file"
                            accept="image/*"
                            id="file"
                            name="frontImage"
                            className="hidden"
                        />
                        <label
                            htmlFor="file"
                            className="text-xl h-full w-full flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-all duration-300"
                            aria-label="Upload Thumbnail"
                        >
                            <div className="text-center">
                                Drag and drop the thumbnail or click to browse
                            </div>
                        </label>
                    </div>
                </div>
                <div className="w-full lg:w-4/6 ">
                    <div className="flex flex-col">
                        <label htmlFor="title">Title</label>
                        <input type="text" id="title" name="title" 
                        placeholder="Title for your podcast"
                        className="mt-4 px-4 py-2 outline-none border border-zinc-800 rounded" />
                    </div>
                    <div className="flex flex-col mt-4">
                        <label htmlFor="title">Description</label>
                        <textarea type="text" id="description" name="description" 
                        placeholder="Description for your podcast"
                        className="mt-4 px-4 py-2 outline-none border border-zinc-800 rounded" rows={4} />
                    </div>
                    <div className="flex mt-4">
                    <div className="flex flex-col w-2/6">
                        <label htmlFor="audioFile">Select Audio</label>
                        <input type="file"
                        accept=".mp3 , .wav , .m4a, .ogg"
                        id="audioFile"
                        className="mt-4" />
                    </div>
                    <div className="flex flex-col w-4/6">
                        <label htmlFor="category">Select Category</label>
                        <select name="category" id="category" className="border border-zinc-900 rounded mt-4 outline-none px-4 py-2">
                            <option value="">Select Category</option>
                            <option value="Comedy">Comedy</option>
                            <option value="Business">Business</option>
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Culture">Culture</option>
                            <option value="News">News</option>
                            <option value="Technology">Technology</option>
                            <option value="Travel">Travel</option>
                        </select>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputPodcast;
