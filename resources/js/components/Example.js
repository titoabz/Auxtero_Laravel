import React, { useEffect, useState } from "react";

export default function Example() {
    const [fname, setFirstname] = useState("");
    const [lname, setLastname] = useState("");
    const [profiles, setProfiles] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editFname, setEditFname] = useState("");
    const [editLname, setEditLname] = useState("");

    const fetchProfiles = async () => {
        try {
            const response = await axios.get("/api/profiles");
            setProfiles(response.data);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/register", {
                fname,
                lname,
            });
            alert("Profile created!");
            setFirstname("");
            setLastname("");
            fetchProfiles();
        } catch (error) {
            alert("Error creating profile.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this profile?")) return;
        try {
            await axios.delete(`/api/profiles/${id}`);
            setProfiles(profiles.filter((p) => p.id !== id));
        } catch (error) {
            alert("Error deleting profile.");
        }
    };

    const handleEdit = (profile) => {
        setEditId(profile.id);
        setEditFname(profile.fname || profile.firstname);
        setEditLname(profile.lname || profile.lastname);
    };

    const handleEditSave = async (id) => {
        try {
            await axios.put(`/api/profiles/${id}`, {
                fname: editFname,
                lname: editLname,
            });
            setEditId(null);
            setEditFname("");
            setEditLname("");
            fetchProfiles();
        } catch (error) {
            alert("Error updating profile.");
        }
    };

    const handleEditCancel = () => {
        setEditId(null);
        setEditFname("");
        setEditLname("");
    };

    return (
        <div className="home">
            <div className="container">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Firstname"
                        value={fname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Lastname"
                        value={lname}
                        onChange={(e) => setLastname(e.target.value)}
                    />
                    <input type="submit" />
                </form>
                {/* Show the current input values as a label */}
                <div style={{ margin: '10px 0', fontWeight: 'bold' }}>
                    {fname || lname ? (
                        <>
                            <label>Current Input: {fname} {lname}</label>
                        </>
                    ) : null}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Firstname</th>
                            <th>Lastname</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile, idx) => (
                            <tr key={profile.id || idx}>
                                {editId === profile.id ? (
                                    <>
                                        <td>
                                            <input
                                                type="text"
                                                value={editFname}
                                                onChange={(e) => setEditFname(e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={editLname}
                                                onChange={(e) => setEditLname(e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button onClick={() => handleEditSave(profile.id)}>Save</button>
                                            <button onClick={handleEditCancel}>Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{profile.fname || profile.firstname}</td>
                                        <td>{profile.lname || profile.lastname}</td>
                                        <td>
                                            <button onClick={() => handleEdit(profile)}>Edit</button>
                                            <button onClick={() => handleDelete(profile.id)}>Delete</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}