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
        <div className="home py-5" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <div className="container shadow p-4 bg-white rounded" style={{ maxWidth: 700 }}>
                <h2 className="mb-4 text-center" style={{ fontWeight: 700, letterSpacing: 1 }}>Profile Manager</h2>
                <form onSubmit={handleSubmit} className="row g-3 align-items-end mb-4">
                    <div className="col-md-5">
                        <label className="form-label">Firstname</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Firstname"
                            value={fname}
                            onChange={(e) => setFirstname(e.target.value)}
                        />
                    </div>
                    <div className="col-md-5">
                        <label className="form-label">Lastname</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Lastname"
                            value={lname}
                            onChange={(e) => setLastname(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2 d-grid">
                        <button type="submit" className="btn btn-primary">Add</button>
                    </div>
                </form>
                {/* Show the current input values as a label */}
                {fname || lname ? (
                    <div className="alert alert-info py-2 mb-4">
                        <strong>Current Input:</strong> {fname} {lname}
                    </div>
                ) : null}
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Firstname</th>
                                <th>Lastname</th>
                                <th style={{ width: 160 }}>Actions</th>
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
                                                    className="form-control"
                                                    value={editFname}
                                                    onChange={(e) => setEditFname(e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={editLname}
                                                    onChange={(e) => setEditLname(e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <button className="btn btn-success btn-sm me-2" onClick={() => handleEditSave(profile.id)}>Save</button>
                                                <button className="btn btn-secondary btn-sm" onClick={handleEditCancel}>Cancel</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{profile.fname || profile.firstname}</td>
                                            <td>{profile.lname || profile.lastname}</td>
                                            <td>
                                                <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(profile)}>Edit</button>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(profile.id)}>Delete</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}