import jwt from 'jsonwebtoken'

export default (payload) => {
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1m' })
    return token
}