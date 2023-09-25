class DocumentDTO {
    constructor(user) {
        //SACO LA BASURA DE EL USUARIO CREADO POR MONGOOSE
        this._id = user._id
        this.first_name = user.first_name
        this.last_name = user.last_name
        this.email = user.email
        this.age = user.age
        this.role = user.role
        this.last_connection = user.last_connection
        let name = user.documents.map(item => item.name)
        let reference = user.documents.map(item => item.reference)
        let doc = [
            { name: name[0], reference: reference[0] },
            { name: name[1], reference: reference[1] },
            { name: name[2], reference: reference[2] }
        ]
        this.documents = doc
        this.recovery_code = user.recovery_code
    }
}

module.exports = DocumentDTO
/*
_id: new ObjectId("651054ec32280545ad75459f"),
  first_name: 'add',
  last_name: 'product',
  email: 'admin@new.com',
  age: null,
  password: '$2b$10$sh5j1Z9imezp04qjQR2lWOyhNaBCEz27/5RACfFTPIDELnGDZwiw.',
  cart: new ObjectId("651054ec32280545ad75459d"),
  role: 'ADMIN',
  last_connection: 2023-09-24T16:47:53.723Z,
  documents: [
    {
      name: 'account',
      reference: '651054ec32280545ad75459f_1695665768535-paypal.JPG',
      _id: new ObjectId("6511ce684cf1588a7a894a82")
    },
    {
      name: 'adress',
      reference: '651054ec32280545ad75459f_1695665768536-paypal.JPG',
      _id: new ObjectId("6511ce684cf1588a7a894a83")
    },
    {
      name: 'info',
      reference: '651054ec32280545ad75459f_1695665768537-paypal.JPG',
      _id: new ObjectId("6511ce684cf1588a7a894a84")
    }
  ],
  recovery_code: [],
  __v: 0
}
*/