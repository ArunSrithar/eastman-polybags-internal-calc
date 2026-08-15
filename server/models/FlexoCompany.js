import mongoose from "mongoose";

const chargeRateSchema = new mongoose.Schema(
    {
        price: { type: Number, required: true, default: 0, min: 0 },
        isAvailable: { type: Boolean, required: true, default: true },
    },
    { _id: false },
);

const flexoCompanySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        isActive: { type: Boolean, required: true, default: true },
        charges: {
            punching: { type: chargeRateSchema, required: true },
            opack: { type: chargeRateSchema, required: true },
        },
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
    },
    {
        collection: "flexoCompanies",
        versionKey: false,
    },
);

flexoCompanySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

flexoCompanySchema.pre("findByIdAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const FlexoCompany = mongoose.model("FlexoCompany", flexoCompanySchema);

export default FlexoCompany;
