import session from "express-session";

const logout = (req, res) => {
    // console.log("session : ", req.session );
    // console.log("User session data:", req.session.user); // Log session data for debugging

    // check if user is logged in before destroying session
    if (!req.session) { //req.session.user // check if iyts set for the user
        return res.status(400).json({ msg: 'No user logged in' });
    }

    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ msg: 'Error logging out' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        return res.status(200).json({ msg: 'Logged out successfully' });
    });
};

export default logout;