import { useEffect, useState } from "react";

const BatchTable = () => {
    const [batches, setBatches] = useState({});

    useEffect(() => {
        fetch("http://localhost:5000/api/alloc/getBatches")
            .then((res) => res.json())
            .then((data) => setBatches(data.batches))
            .catch((error) => console.error("Error fetching batches:", error));
    }, []);

    return (
        <div className="container mx-auto p-6">
            {Object.entries(batches).map(([batchNumber, batch]) => (
                <div key={batchNumber} className="mb-8 bg-white shadow-lg rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">
                        Batch Number: {batchNumber}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-lg">
                            <thead>
                                <tr className="bg-gray-200 text-gray-700">
                                    <th className="border p-3">RegdNo</th>
                                    <th className="border p-3">Review-1</th>
                                    <th className="border p-3">Review-2</th>
                                    <th className="border p-3">Review-3</th>
                                    <th className="border p-3">Review-4</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batch.students.map((regd, index) => (
                                    <tr key={index} className="text-center hover:bg-gray-100">
                                        <td className="border p-3">{regd}</td>
                                        <td className="border p-3">
                                            <input type="text" className="w-full p-2 border rounded" />
                                        </td>
                                        <td className="border p-3">
                                            <input type="text" className="w-full p-2 border rounded" />
                                        </td>
                                        <td className="border p-3">
                                            <input type="text" className="w-full p-2 border rounded" />
                                        </td>
                                        <td className="border p-3">
                                            <input type="text" className="w-full p-2 border rounded" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center mt-4">
                        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600">
                            Submit
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BatchTable;