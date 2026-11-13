const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        // The user who owns this note (matches assignment spec "owner")
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Virtual property for 'user' backward compatibility
noteSchema.virtual("user").get(function () {
    return this.owner;
}).set(function (v) {
    this.owner = v;
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
