const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Virtual property for 'name' backward compatibility
userSchema.virtual("name").get(function () {
    return this.username;
}).set(function (v) {
    this.username = v;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
