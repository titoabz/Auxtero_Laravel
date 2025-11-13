import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from './HeaderBar';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showStudentPerformanceModal, setShowStudentPerformanceModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    schedule: '',
    status: 'active'
  });
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    schedule: '',
    room: '',
    capacity: ''
  });
  const [studentFormData, setStudentFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    attendance: '',
    grade: '',
    grade_percentage: '',
    present: '',
    absent: '',
    late: '',
    total_classes: ''
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch('/api/courses', {
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error('Failed to load courses');
        // Load default courses if API fails
        const defaultCourses = [
        {
          id: 1,
          code: 'CS101',
          name: 'Introduction to Computer Science',
          schedule: 'MWF 9:00 AM - 10:00 AM',
          status: 'active',
          sections: [
            {
              id: 1,
              name: 'Section A',
              schedule: 'MWF 9:00 AM - 10:00 AM',
              room: 'Room 101',
              capacity: 30,
              students: [
                {
                  id: 1,
                  studentId: 'S0001234',
                  name: 'Sarah Chen',
                  email: 'sarah.chen@student.edu',
                  attendance: 92,
                  grade: 'A',
                  gradePercentage: 95,
                  present: 23,
                  absent: 2,
                  late: 0,
                  totalClasses: 25
                },
                {
                  id: 2,
                  studentId: 'S0001235',
                  name: 'John Smith',
                  email: 'john.smith@student.edu',
                  attendance: 88,
                  grade: 'B+',
                  gradePercentage: 87,
                  present: 22,
                  absent: 3,
                  late: 0,
                  totalClasses: 25
                }
              ]
            },
            {
              id: 2,
              name: 'Section B',
              schedule: 'MWF 10:30 AM - 11:30 AM',
              room: 'Room 102',
              capacity: 30,
              students: [
                {
                  id: 3,
                  studentId: 'S0001236',
                  name: 'Maria Garcia',
                  email: 'maria.garcia@student.edu',
                  attendance: 96,
                  grade: 'A',
                  gradePercentage: 98,
                  present: 24,
                  absent: 1,
                  late: 0,
                  totalClasses: 25
                }
              ]
            }
          ]
        },
        {
          id: 2,
          code: 'CS201',
          name: 'Data Structures and Algorithms',
          schedule: 'TTh 1:00 PM - 2:30 PM',
          status: 'active',
          sections: [
            {
              id: 3,
              name: 'Section A',
              schedule: 'TTh 1:00 PM - 2:30 PM',
              room: 'Room 201',
              capacity: 25,
              students: [
                {
                  id: 4,
                  studentId: 'S0001237',
                  name: 'Michael Brown',
                  email: 'michael.brown@student.edu',
                  attendance: 84,
                  grade: 'B',
                  gradePercentage: 83,
                  present: 21,
                  absent: 4,
                  late: 0,
                  totalClasses: 25
                }
              ]
            }
          ]
        }
        ];
        setCourses(defaultCourses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleAddCourse = () => {
    setFormData({
      code: '',
      name: '',
      schedule: '',
      status: 'active'
    });
    setShowAddModal(true);
  };

  const handleViewCourse = async (course) => {
    setViewingCourse(course);
    setShowViewModal(true);
  };

  const handleViewSection = (section) => {
    setSelectedSection(section);
    setShowSectionModal(true);
  };

  const handleViewStudentPerformance = (student) => {
    setSelectedStudent(student);
    setShowStudentPerformanceModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      schedule: course.schedule,
      status: course.status
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(courses.map(c => 
          c.id === editingCourse.id ? updatedCourse : c
        ));
        setShowEditModal(false);
        setEditingCourse(null);
      } else {
        console.error('Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newCourse = await response.json();
        setCourses([...courses, newCourse]);
        setShowAddModal(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to add course:', errorData);
        alert('Failed to add course: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Error adding course: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSection = () => {
    setSectionFormData({
      name: '',
      schedule: '',
      room: '',
      capacity: ''
    });
    setShowAddSectionModal(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`/api/courses/${viewingCourse.id}/sections`, {
        method: 'POST',
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sectionFormData)
      });

      if (response.ok) {
        const newSection = await response.json();
        // Update the viewing course with the new section
        const updatedCourse = {
          ...viewingCourse,
          sections: [...(viewingCourse.sections || []), newSection]
        };
        setViewingCourse(updatedCourse);
        // Also update in courses list
        setCourses(courses.map(c => 
          c.id === viewingCourse.id ? updatedCourse : c
        ));
        setShowAddSectionModal(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to add section:', errorData);
        alert('Failed to add section: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Error adding section: ' + error.message);
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionFormData({
      name: section.name,
      schedule: section.schedule,
      room: section.room,
      capacity: section.capacity
    });
    setShowEditSectionModal(true);
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`/api/courses/${viewingCourse.id}/sections/${editingSection.id}`, {
        method: 'PUT',
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sectionFormData)
      });

      if (response.ok) {
        const updatedSection = await response.json();
        // Update the viewing course sections
        const updatedCourse = {
          ...viewingCourse,
          sections: viewingCourse.sections.map(s => 
            s.id === editingSection.id ? updatedSection : s
          )
        };
        setViewingCourse(updatedCourse);
        // Also update in courses list
        setCourses(courses.map(c => 
          c.id === viewingCourse.id ? updatedCourse : c
        ));
        setShowEditSectionModal(false);
        setEditingSection(null);
      } else {
        console.error('Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section? All students in this section will also be removed.')) {
      return;
    }

    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`/api/courses/${viewingCourse.id}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update the viewing course by removing the section
        const updatedCourse = {
          ...viewingCourse,
          sections: viewingCourse.sections.filter(s => s.id !== sectionId)
        };
        setViewingCourse(updatedCourse);
        // Also update in courses list
        setCourses(courses.map(c => 
          c.id === viewingCourse.id ? updatedCourse : c
        ));
      } else {
        console.error('Failed to delete section');
        alert('Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section: ' + error.message);
    }
  };

  const handleStudentInputChange = (e) => {
    const { name, value } = e.target;
    setStudentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudent = () => {
    setStudentFormData({
      student_id: '',
      name: '',
      email: '',
      attendance: '0',
      grade: '',
      grade_percentage: '0',
      present: '0',
      absent: '0',
      late: '0',
      total_classes: '0'
    });
    setShowAddStudentModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`/api/courses/${viewingCourse.id}/sections/${selectedSection.id}/students`, {
        method: 'POST',
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentFormData)
      });

      if (response.ok) {
        const newStudent = await response.json();
        // Update the selected section with the new student
        const updatedSection = {
          ...selectedSection,
          students: [...(selectedSection.students || []), newStudent]
        };
        setSelectedSection(updatedSection);
        
        // Update the viewing course sections
        const updatedCourse = {
          ...viewingCourse,
          sections: viewingCourse.sections.map(s => 
            s.id === selectedSection.id ? updatedSection : s
          )
        };
        setViewingCourse(updatedCourse);
        
        // Also update in courses list
        setCourses(courses.map(c => 
          c.id === viewingCourse.id ? updatedCourse : c
        ));
        
        setShowAddStudentModal(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to add student:', errorData);
        alert('Failed to add student: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student: ' + error.message);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentFormData({
      student_id: student.student_id || student.studentId,
      name: student.name,
      email: student.email,
      attendance: student.attendance?.toString() || '0',
      grade: student.grade || '',
      grade_percentage: student.grade_percentage?.toString() || student.gradePercentage?.toString() || '0',
      present: student.present?.toString() || '0',
      absent: student.absent?.toString() || '0',
      late: student.late?.toString() || '0',
      total_classes: student.total_classes?.toString() || student.totalClasses?.toString() || '0'
    });
    setShowEditStudentModal(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`/api/courses/${viewingCourse.id}/sections/${selectedSection.id}/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentFormData)
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        // Update the selected section students
        const updatedSection = {
          ...selectedSection,
          students: selectedSection.students.map(s => 
            s.id === editingStudent.id ? updatedStudent : s
          )
        };
        setSelectedSection(updatedSection);
        
        // Update the viewing course sections
        const updatedCourse = {
          ...viewingCourse,
          sections: viewingCourse.sections.map(s => 
            s.id === selectedSection.id ? updatedSection : s
          )
        };
        setViewingCourse(updatedCourse);
        
        // Also update in courses list
        setCourses(courses.map(c => 
          c.id === viewingCourse.id ? updatedCourse : c
        ));
        
        setShowEditStudentModal(false);
        setEditingStudent(null);
      } else {
        console.error('Failed to update student');
        alert('Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student: ' + error.message);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to remove this student from the section?')) {
      return;
    }

    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`/api/courses/${viewingCourse.id}/sections/${selectedSection.id}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'X-Portal-Auth': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update the selected section by removing the student
        const updatedSection = {
          ...selectedSection,
          students: selectedSection.students.filter(s => s.id !== studentId)
        };
        setSelectedSection(updatedSection);
        
        // Update the viewing course sections
        const updatedCourse = {
          ...viewingCourse,
          sections: viewingCourse.sections.map(s => 
            s.id === selectedSection.id ? updatedSection : s
          )
        };
        setViewingCourse(updatedCourse);
        
        // Also update in courses list
        setCourses(courses.map(c => 
          c.id === viewingCourse.id ? updatedCourse : c
        ));
      } else {
        console.error('Failed to delete student');
        alert('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student: ' + error.message);
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setShowAddModal(false);
    setShowViewModal(false);
    setShowSectionModal(false);
    setShowStudentPerformanceModal(false);
    setShowAddSectionModal(false);
    setShowEditSectionModal(false);
    setShowAddStudentModal(false);
    setShowEditStudentModal(false);
    setEditingCourse(null);
    setViewingCourse(null);
    setSelectedSection(null);
    setSelectedStudent(null);
    setEditingSection(null);
    setEditingStudent(null);
    setCourseStudents([]);
  };

  return (
    <>
      <HeaderBar />
      <div className="container mt-4">
        <div className="card">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0">Courses</h4>
              <button className="btn btn-primary" onClick={handleAddCourse}>
                Add Course
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center text-muted py-5">
                <h5>No courses yet</h5>
                <p>Add your first course to get started</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Sections</th>
                      <th>Total Students</th>
                      <th>Schedule</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => {
                      const totalStudents = course.sections?.reduce((sum, section) => sum + (section.students?.length || 0), 0) || 0;
                      return (
                        <tr key={course.id}>
                          <td><strong>{course.code}</strong></td>
                          <td style={{color: '#0d6efd'}}>{course.name}</td>
                          <td>{course.sections?.length || 0}</td>
                          <td>{totalStudents}</td>
                          <td style={{color: '#0d6efd'}}>{course.schedule}</td>
                          <td>
                            <span className="badge bg-success text-white" style={{padding: '6px 12px', borderRadius: '6px'}}>
                              {course.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2" 
                              onClick={() => handleViewCourse(course)}
                            >
                              View Sections
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary" 
                              onClick={() => handleEditCourse(course)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Edit Course Modal */}
        {showEditModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Course</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSaveEdit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Course Code</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Course Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Schedule</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="schedule"
                        value={formData.schedule}
                        onChange={handleInputChange}
                        placeholder="e.g., MWF 9:00 AM - 10:00 AM"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Course Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Course</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSaveAdd}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Course Code</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g., CS301"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Course Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Advanced Programming"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Schedule</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="schedule"
                        value={formData.schedule}
                        onChange={handleInputChange}
                        placeholder="e.g., MWF 9:00 AM - 10:00 AM"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Course Sections Modal */}
        {showViewModal && viewingCourse && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{borderRadius: '12px'}}>
                <div className="modal-header" style={{borderBottom: '2px solid #e5e7eb', padding: '20px 30px'}}>
                  <div>
                    <h5 className="modal-title" style={{fontSize: '20px', fontWeight: '600', color: '#1f2937'}}>
                      {viewingCourse.code} - {viewingCourse.name}
                    </h5>
                    <p className="mb-0 text-muted" style={{fontSize: '14px', marginTop: '4px'}}>Course Sections</p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAddSection}>
                      <i className="bi bi-plus-lg"></i> Add Section
                    </button>
                    <button type="button" className="btn-close" onClick={closeModal}></button>
                  </div>
                </div>
                <div className="modal-body" style={{padding: '30px'}}>
                  {!viewingCourse.sections || viewingCourse.sections.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <h5>No sections yet</h5>
                      <p>Add sections to this course to get started</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {viewingCourse.sections.map(section => (
                        <div key={section.id} className="col-12">
                          <div className="card" style={{border: '1px solid #e5e7eb', borderRadius: '10px'}}>
                            <div className="card-body" style={{padding: '20px'}}>
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <h6 className="mb-0" style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>
                                      📚 {section.name}
                                    </h6>
                                    <span className="badge" style={{
                                      backgroundColor: '#dbeafe',
                                      color: '#1e40af',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '600'
                                    }}>
                                      {section.students?.length || 0} / {section.capacity} Students
                                    </span>
                                  </div>
                                  <div className="row mt-3">
                                    <div className="col-md-4">
                                      <div style={{fontSize: '12px', color: '#9ca3af'}}>Schedule</div>
                                      <div style={{fontSize: '14px', color: '#374151', fontWeight: '500'}}>{section.schedule}</div>
                                    </div>
                                    <div className="col-md-4">
                                      <div style={{fontSize: '12px', color: '#9ca3af'}}>Room</div>
                                      <div style={{fontSize: '14px', color: '#374151', fontWeight: '500'}}>{section.room}</div>
                                    </div>
                                    <div className="col-md-4">
                                      <div style={{fontSize: '12px', color: '#9ca3af'}}>Capacity</div>
                                      <div style={{fontSize: '14px', color: '#374151', fontWeight: '500'}}>{section.capacity} students</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-success" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSection(section);
                                    }}
                                    style={{borderRadius: '6px'}}
                                  >
                                    <i className="bi bi-pencil"></i> Edit
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSection(section.id);
                                    }}
                                    style={{borderRadius: '6px'}}
                                  >
                                    <i className="bi bi-trash"></i> Delete
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-primary" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewSection(section);
                                    }}
                                    style={{borderRadius: '6px'}}
                                  >
                                    View Students
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-footer" style={{borderTop: '2px solid #e5e7eb', padding: '16px 30px'}}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Section Students Modal */}
        {showSectionModal && selectedSection && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-xl" style={{maxWidth: '1400px'}}>
              <div className="modal-content" style={{borderRadius: '12px'}}>
                <div className="modal-header" style={{borderBottom: '2px solid #e5e7eb', padding: '20px 30px'}}>
                  <div>
                    <h5 className="modal-title" style={{fontSize: '20px', fontWeight: '600', color: '#1f2937'}}>
                      {selectedSection.name} - Students
                    </h5>
                    <p className="mb-0 text-muted" style={{fontSize: '14px', marginTop: '4px'}}>
                      {selectedSection.schedule} • {selectedSection.room}
                    </p>
                  </div>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body" style={{padding: '30px'}}>
                  {!selectedSection.students || selectedSection.students.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <h5>No students enrolled</h5>
                      <p>Students will appear here once they are assigned to this section</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead style={{backgroundColor: '#f9fafb'}}>
                          <tr>
                            <th style={{padding: '16px', fontWeight: '600', color: '#374151'}}>Student ID</th>
                            <th style={{padding: '16px', fontWeight: '600', color: '#374151'}}>Name</th>
                            <th style={{padding: '16px', fontWeight: '600', color: '#374151'}}>Email</th>
                            <th style={{padding: '16px', fontWeight: '600', color: '#374151'}}>Grade</th>
                            <th style={{padding: '16px', fontWeight: '600', color: '#374151'}}>Attendance</th>
                            <th style={{padding: '16px', fontWeight: '600', color: '#374151'}}>Status</th>
                            <th style={{padding: '16px', fontWeight: '600', color: '#374151'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSection.students.map(student => (
                            <tr key={student.id} style={{borderBottom: '1px solid #e5e7eb'}}>
                              <td style={{padding: '16px'}}>
                                <strong style={{color: '#1f2937'}}>{student.studentId}</strong>
                              </td>
                              <td style={{padding: '16px'}}>
                                <div className="d-flex align-items-center gap-2">
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    backgroundColor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#1e40af'
                                  }}>
                                    {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </div>
                                  <span style={{color: '#1f2937', fontWeight: '500'}}>{student.name}</span>
                                </div>
                              </td>
                              <td style={{padding: '16px', color: '#6b7280'}}>{student.email}</td>
                              <td style={{padding: '16px'}}>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge" style={{
                                    backgroundColor: student.gradePercentage >= 90 ? '#dcfce7' : student.gradePercentage >= 80 ? '#fef3c7' : '#fee2e2',
                                    color: student.gradePercentage >= 90 ? '#166534' : student.gradePercentage >= 80 ? '#92400e' : '#991b1b',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                  }}>
                                    {student.grade}
                                  </span>
                                  <span style={{fontSize: '13px', color: '#6b7280'}}>({student.gradePercentage}%)</span>
                                </div>
                              </td>
                              <td style={{padding: '16px'}}>
                                <div>
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <span style={{
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color: student.attendance >= 90 ? '#22c55e' : student.attendance >= 75 ? '#eab308' : '#ef4444'
                                    }}>
                                      {student.attendance}%
                                    </span>
                                  </div>
                                  <div style={{
                                    height: '4px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    width: '80px'
                                  }}>
                                    <div style={{
                                      width: `${student.attendance}%`,
                                      height: '100%',
                                      backgroundColor: student.attendance >= 90 ? '#22c55e' : student.attendance >= 75 ? '#eab308' : '#ef4444',
                                      borderRadius: '2px'
                                    }}></div>
                                  </div>
                                </div>
                              </td>
                              <td style={{padding: '16px'}}>
                                <span className="badge" style={{
                                  backgroundColor: student.gradePercentage >= 75 && student.attendance >= 75 ? '#dcfce7' : '#fee2e2',
                                  color: student.gradePercentage >= 75 && student.attendance >= 75 ? '#166534' : '#991b1b',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {student.gradePercentage >= 75 && student.attendance >= 75 ? 'Good Standing' : 'At Risk'}
                                </span>
                              </td>
                              <td style={{padding: '16px'}}>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewStudentPerformance(student)}
                                    style={{borderRadius: '6px', fontSize: '13px'}}
                                  >
                                    <i className="bi bi-eye"></i> View
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleEditStudent(student)}
                                    style={{borderRadius: '6px', fontSize: '13px'}}
                                  >
                                    <i className="bi bi-pencil"></i> Edit
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteStudent(student.id)}
                                    style={{borderRadius: '6px', fontSize: '13px'}}
                                  >
                                    <i className="bi bi-trash"></i> Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer" style={{borderTop: '2px solid #e5e7eb', padding: '16px 30px'}}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Performance Detail Modal */}
        {showStudentPerformanceModal && selectedStudent && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-xl" style={{maxWidth: '1200px'}}>
              <div className="modal-content" style={{borderRadius: '12px'}}>
                <div className="modal-body p-0">
                  {/* Student Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '40px',
                    color: 'white',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                  }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          fontWeight: '700',
                          color: 'white',
                          border: '3px solid white'
                        }}>
                          {selectedStudent.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="mb-1" style={{fontWeight: '600', fontSize: '28px'}}>{selectedStudent.name}</h3>
                          <p className="mb-0" style={{fontSize: '16px', opacity: 0.9}}>Student ID: {selectedStudent.studentId}</p>
                        </div>
                      </div>
                      <button className="btn btn-light" style={{borderRadius: '8px'}} onClick={closeModal}>Close</button>
                    </div>
                  </div>

                  {/* Performance Details */}
                  <div style={{padding: '30px 40px'}}>
                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                      <div className="col-md-3">
                        <div className="card" style={{border: '1px solid #e5e7eb', borderRadius: '10px'}}>
                          <div className="card-body text-center" style={{padding: '20px'}}>
                            <div style={{fontSize: '12px', color: '#9ca3af', marginBottom: '8px'}}>Current Grade</div>
                            <div style={{fontSize: '32px', fontWeight: '700', color: '#4f46e5'}}>{selectedStudent.grade}</div>
                            <div style={{fontSize: '14px', color: '#6b7280', marginTop: '4px'}}>{selectedStudent.gradePercentage}%</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card" style={{border: '1px solid #e5e7eb', borderRadius: '10px'}}>
                          <div className="card-body text-center" style={{padding: '20px'}}>
                            <div style={{fontSize: '12px', color: '#9ca3af', marginBottom: '8px'}}>Attendance Rate</div>
                            <div style={{fontSize: '32px', fontWeight: '700', color: '#22c55e'}}>{selectedStudent.attendance}%</div>
                            <div style={{fontSize: '14px', color: '#6b7280', marginTop: '4px'}}>{selectedStudent.present}/{selectedStudent.totalClasses} classes</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card" style={{border: '1px solid #e5e7eb', borderRadius: '10px'}}>
                          <div className="card-body text-center" style={{padding: '20px'}}>
                            <div style={{fontSize: '12px', color: '#9ca3af', marginBottom: '8px'}}>Classes Attended</div>
                            <div style={{fontSize: '32px', fontWeight: '700', color: '#3b82f6'}}>{selectedStudent.present}</div>
                            <div style={{fontSize: '14px', color: '#6b7280', marginTop: '4px'}}>Present</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card" style={{border: '1px solid #e5e7eb', borderRadius: '10px'}}>
                          <div className="card-body text-center" style={{padding: '20px'}}>
                            <div style={{fontSize: '12px', color: '#9ca3af', marginBottom: '8px'}}>Absences</div>
                            <div style={{fontSize: '32px', fontWeight: '700', color: selectedStudent.absent > 3 ? '#ef4444' : '#f59e0b'}}>{selectedStudent.absent}</div>
                            <div style={{fontSize: '14px', color: '#6b7280', marginTop: '4px'}}>
                              {selectedStudent.late > 0 ? `${selectedStudent.late} late` : 'No lates'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="row g-4">
                      {/* Attendance Details */}
                      <div className="col-md-6">
                        <div className="card h-100" style={{border: '1px solid #e5e7eb', borderRadius: '10px'}}>
                          <div className="card-body" style={{padding: '24px'}}>
                            <h6 className="mb-4" style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>
                              📊 Attendance Breakdown
                            </h6>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-2">
                                <span style={{fontSize: '14px', color: '#374151'}}>Present</span>
                                <span style={{fontSize: '14px', fontWeight: '600', color: '#22c55e'}}>{selectedStudent.present} / {selectedStudent.totalClasses}</span>
                              </div>
                              <div style={{
                                height: '8px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(selectedStudent.present / selectedStudent.totalClasses) * 100}%`,
                                  height: '100%',
                                  backgroundColor: '#22c55e',
                                  borderRadius: '4px'
                                }}></div>
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-2">
                                <span style={{fontSize: '14px', color: '#374151'}}>Absent</span>
                                <span style={{fontSize: '14px', fontWeight: '600', color: '#ef4444'}}>{selectedStudent.absent}</span>
                              </div>
                              <div style={{
                                height: '8px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(selectedStudent.absent / selectedStudent.totalClasses) * 100}%`,
                                  height: '100%',
                                  backgroundColor: '#ef4444',
                                  borderRadius: '4px'
                                }}></div>
                              </div>
                            </div>
                            <div className="mb-0">
                              <div className="d-flex justify-content-between mb-2">
                                <span style={{fontSize: '14px', color: '#374151'}}>Late</span>
                                <span style={{fontSize: '14px', fontWeight: '600', color: '#f59e0b'}}>{selectedStudent.late}</span>
                              </div>
                              <div style={{
                                height: '8px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(selectedStudent.late / selectedStudent.totalClasses) * 100}%`,
                                  height: '100%',
                                  backgroundColor: '#f59e0b',
                                  borderRadius: '4px'
                                }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Status */}
                      <div className="col-md-6">
                        <div className="card h-100" style={{border: '1px solid #e5e7eb', borderRadius: '10px'}}>
                          <div className="card-body" style={{padding: '24px'}}>
                            <h6 className="mb-4" style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>
                              🎯 Performance Status
                            </h6>
                            <div className="mb-4">
                              <div style={{fontSize: '14px', color: '#9ca3af', marginBottom: '8px'}}>Academic Standing</div>
                              <span className="badge" style={{
                                backgroundColor: selectedStudent.gradePercentage >= 75 ? '#dcfce7' : '#fee2e2',
                                color: selectedStudent.gradePercentage >= 75 ? '#166534' : '#991b1b',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}>
                                {selectedStudent.gradePercentage >= 90 ? 'Excellent' : selectedStudent.gradePercentage >= 75 ? 'Good Standing' : 'At Risk'}
                              </span>
                            </div>
                            <div className="mb-4">
                              <div style={{fontSize: '14px', color: '#9ca3af', marginBottom: '8px'}}>Attendance Status</div>
                              <span className="badge" style={{
                                backgroundColor: selectedStudent.attendance >= 90 ? '#dcfce7' : selectedStudent.attendance >= 75 ? '#fef3c7' : '#fee2e2',
                                color: selectedStudent.attendance >= 90 ? '#166534' : selectedStudent.attendance >= 75 ? '#92400e' : '#991b1b',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}>
                                {selectedStudent.attendance >= 90 ? 'Excellent' : selectedStudent.attendance >= 75 ? 'Satisfactory' : 'Needs Improvement'}
                              </span>
                            </div>
                            <div>
                              <div style={{fontSize: '14px', color: '#9ca3af', marginBottom: '8px'}}>Email</div>
                              <div style={{fontSize: '14px', color: '#1f2937', fontWeight: '500'}}>{selectedStudent.email}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Section Modal */}
        {showAddSectionModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Section</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSaveSection}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Section Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={sectionFormData.name}
                        onChange={handleSectionInputChange}
                        placeholder="e.g., Section A"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Schedule</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="schedule"
                        value={sectionFormData.schedule}
                        onChange={handleSectionInputChange}
                        placeholder="e.g., MWF 9:00 AM - 10:00 AM"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Room</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="room"
                        value={sectionFormData.room}
                        onChange={handleSectionInputChange}
                        placeholder="e.g., Room 101"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Capacity</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="capacity"
                        value={sectionFormData.capacity}
                        onChange={handleSectionInputChange}
                        placeholder="e.g., 30"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Section
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Section Modal */}
        {showEditSectionModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Section</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleUpdateSection}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Section Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={sectionFormData.name}
                        onChange={handleSectionInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Schedule</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="schedule"
                        value={sectionFormData.schedule}
                        onChange={handleSectionInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Room</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="room"
                        value={sectionFormData.room}
                        onChange={handleSectionInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Capacity</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="capacity"
                        value={sectionFormData.capacity}
                        onChange={handleSectionInputChange}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudentModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Student</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSaveStudent}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Student ID</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="student_id"
                          value={studentFormData.student_id}
                          onChange={handleStudentInputChange}
                          placeholder="e.g., S0001234"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Full Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="name"
                          value={studentFormData.name}
                          onChange={handleStudentInputChange}
                          placeholder="e.g., John Doe"
                          required
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          name="email"
                          value={studentFormData.email}
                          onChange={handleStudentInputChange}
                          placeholder="e.g., john.doe@student.edu"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Grade</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="grade"
                          value={studentFormData.grade}
                          onChange={handleStudentInputChange}
                          placeholder="e.g., A, B+, C"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Grade Percentage</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="grade_percentage"
                          value={studentFormData.grade_percentage}
                          onChange={handleStudentInputChange}
                          placeholder="0-100"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Present</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="present"
                          value={studentFormData.present}
                          onChange={handleStudentInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Absent</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="absent"
                          value={studentFormData.absent}
                          onChange={handleStudentInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Late</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="late"
                          value={studentFormData.late}
                          onChange={handleStudentInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Total Classes</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="total_classes"
                          value={studentFormData.total_classes}
                          onChange={handleStudentInputChange}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditStudentModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Student</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleUpdateStudent}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Student ID</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="student_id"
                          value={studentFormData.student_id}
                          onChange={handleStudentInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Full Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="name"
                          value={studentFormData.name}
                          onChange={handleStudentInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          name="email"
                          value={studentFormData.email}
                          onChange={handleStudentInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Grade</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="grade"
                          value={studentFormData.grade}
                          onChange={handleStudentInputChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Grade Percentage</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="grade_percentage"
                          value={studentFormData.grade_percentage}
                          onChange={handleStudentInputChange}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Present</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="present"
                          value={studentFormData.present}
                          onChange={handleStudentInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Absent</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="absent"
                          value={studentFormData.absent}
                          onChange={handleStudentInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Late</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="late"
                          value={studentFormData.late}
                          onChange={handleStudentInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Total Classes</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          name="total_classes"
                          value={studentFormData.total_classes}
                          onChange={handleStudentInputChange}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
