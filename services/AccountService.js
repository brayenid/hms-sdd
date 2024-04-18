const generateId = require('../globals/idgenerator')
const bcrypt = require('bcrypt')
const config = require('../globals/config')
const { pool } = require('../db/pool')

class AccountService {
  constructor() {
    this._pool = pool
  }

  async addAccount(payload) {
    const { username, name, password, role } = payload
    const id = `ACC-${generateId(12)}`
    try {
      const query = {
        text: 'INSERT INTO accounts (id, username, name, password, role) VALUES($1, $2, $3, $4, $5)',
        values: [id, username, name, password, role]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add account : ${error.message}`)
    }
  }

  async putAccount(payload) {
    const { id, name, role } = payload
    const currentTime = new Date()
    try {
      const query = {
        text: `
        UPDATE accounts
        SET name = $1, role = $2, updated_at = $3
        WHERE id = $4
        `,
        values: [name, role, currentTime, id]
      }
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put account : ${error.message}`)
    }
  }

  async getAccounts(search = '') {
    const query = {
      text: `
      SELECT id, username, role, name
      FROM accounts 
      WHERE (username ILIKE $1 OR name ILIKE $1) AND id != 'system'`,
      values: [`%${search}%`]
    }
    try {
      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get accounts : ${error.message}`)
    }
  }

  async getAccountById(id) {
    const query = {
      text: `
      SELECT id, username, name, role
      FROM accounts
      WHERE id = $1
      LIMIT 1`,
      values: [id]
    }
    try {
      const { rows, rowCount } = await this._pool.query(query)
      if (!rowCount) {
        throw new Error('Akun tidak ditemukan')
      }
      return rows[0]
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getAccountByUsername(username) {
    const query = {
      text: 'SELECT id, password, role, name FROM accounts WHERE username = $1 LIMIT 1',
      values: [username]
    }

    try {
      const { rows, rowCount } = await this._pool.query(query)
      if (!rowCount) {
        throw new Error('Akun tidak ada')
      }
      return rows[0]
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async patchPassword(id, password) {
    const currentTime = new Date()
    try {
      const query = {
        text: 'UPDATE accounts SET password = $1, updated_at = $2 WHERE id = $3',
        values: [password, currentTime, id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Patch password : ${error.message}`)
    }
  }

  async deleteAccountById(id) {
    try {
      await this.getAccountById(id)
      const query = {
        text: 'DELETE FROM accounts WHERE id = $1',
        values: [id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Delete account : ${error.message}`)
    }
  }

  async checkSudoAvailability() {
    try {
      const { rowCount } = await this._pool.query("SELECT * FROM accounts WHERE role = 'sudo' LIMIT 1")
      if (rowCount) {
        throw new Error('Akun Super Admin sudah ada')
      }
    } catch (error) {
      throw new Error(`Sudo availability : ${error.message}`)
    }
  }

  async verifyCredential(username, password) {
    try {
      const detail = await this.getAccountByUsername(username)
      const isMatched = await bcrypt.compare(password, detail.password)
      if (!isMatched) {
        throw new Error('Password salah')
      }
      return detail
    } catch (error) {
      throw new Error(`Verify credential : ${error.message}`)
    }
  }

  async resetSudo() {
    const hashedPassword = await bcrypt.hash(config.sudo.password, 10)
    try {
      const query = {
        text: `
        UPDATE
          accounts
        SET 
          password = $1
        WHERE
          username = 'sudo'
        `,
        values: [hashedPassword]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Reset sudo : ${error.message}`)
    }
  }
}

module.exports = AccountService
