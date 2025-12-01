import React, { useState } from 'react';
import axios from 'axios';
import styles from './Create_Admin.module.css';
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer";
import Content from "../../components/content/Content";

const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        CNIC: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        
        const { CNIC, confirmPassword } = formData;
        
        if (!CNIC || !confirmPassword) {
            setMessage("Please fill in all fields.");
            return;
        }

        if (!/^\d{13}$/.test(CNIC)) {
            setMessage("CNIC must be exactly 13 digits.");
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await axios.post('/api/admins/createAdmin',
                { CNIC, confirmPassword },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            
            if (response.data.success) {
                setMessage("Admin created successfully!");
                setFormData({
                    CNIC: '',
                    confirmPassword: ''
                });
            } else {
                setMessage(response.data.message || "Admin creation failed.");
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "An error occurred. Please try again.");
            console.error("Error creating admin:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <Header/>
        <Content>
            <div className={styles.container}>
                <h2>Create Admin</h2>
                <form onSubmit={handleCreateAdmin}>
                    <div className={styles.formGroup}>
                        <label htmlFor="CNIC">CNIC</label>
                        <input
                            type="text"
                            id="CNIC"
                            name="CNIC"
                            value={formData.CNIC}
                            onChange={handleChange}
                            placeholder="Enter 13-digit CNIC"
                            maxLength={13}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm Your Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Enter your current password"
                        />
                    </div>

                    {message && (
                        <div className={`${styles.message} ${message.includes('successfully') ? styles.success : styles.error}`}>
                            {message}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create Admin'}
                    </button>
                </form>
            </div>
        </Content>
        <Footer/>
        </>
    );
};

export default CreateAdmin;