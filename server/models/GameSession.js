import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    access_key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    current_slide: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed_slides: {
      type: [Number],
      default: [],
    },
    is_completed: {
      type: Boolean,
      default: false,
    },
    pickup_code: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    pickup_qr_data_url: {
      type: String,
      default: null,
    },
    pickup_used: {
      type: Boolean,
      default: false,
    },
    stripe_checkout_session_id: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    hunt_name: {
      type: String,
      default: "The Emperor's Secret",
    },
    redeemed_at: {
      type: Date,
      default: null,
    },
    expires_at: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export const GameSession = mongoose.model("GameSession", gameSessionSchema);
