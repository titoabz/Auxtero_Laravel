import React, { useState } from 'react';

export default function CrudPage() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Create
  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim() !== '') {
      setItems([...items, input]);
      setInput('');
    }
  };

  // Read is just rendering the list

  // Update
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditValue(items[index]);
  };
  const handleUpdate = (index) => {
    const updated = [...items];
    updated[index] = editValue;
    setItems(updated);
    setEditIndex(null);
    setEditValue('');
  };

  // Delete
  const handleDelete = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>CRUD Page</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: '1em' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add new item"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>
            {editIndex === idx ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                />
                <button onClick={() => handleUpdate(idx)}>Save</button>
                <button onClick={() => setEditIndex(null)}>Cancel</button>
              </>
            ) : (
              <>
                {item}
                <button onClick={() => handleEdit(idx)} style={{ marginLeft: '1em' }}>Edit</button>
                <button onClick={() => handleDelete(idx)} style={{ marginLeft: '0.5em' }}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
