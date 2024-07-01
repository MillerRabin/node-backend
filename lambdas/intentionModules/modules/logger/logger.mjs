import { writePool } from "../db.mjs";

export const loginResultLog = async ({ user_id, system_id, threshold, result, success_login }) => {
    const values = [];
    const text = `INSERT INTO node.authlogs (user_id, system_id, result, threshold, success_login )
    VALUES ($${
        values.push(user_id)
    }, $${
        values.push(system_id)
    }, $${
        values.push(result)
    }, $${
        values.push(threshold)
    }, $${
        values.push(success_login)
    });`
    try {
        await writePool.query({ text, values });
    } catch (err) {
        console.log(err);
    }
};
