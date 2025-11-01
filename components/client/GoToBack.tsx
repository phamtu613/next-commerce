"use client";
export default function GoToBackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
            Go Back
        </button>
    );
}
