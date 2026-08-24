export async function checkAuth(req, res,next) {

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized anna" });
    }
     res.status(200).json({ message: "User is authenticated", user: req.user });
}
