import mongoose from "mongoose";

const processRateSchema = new mongoose.Schema(
    {
        price: { type: Number, required: true, default: 0, min: 0 },
        isAvailable: { type: Boolean, required: true, default: true },
    },
    { _id: false },
);

const gravureCompanySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        isActive: { type: Boolean, required: true, default: true },
        processes: {
            normalColor: { type: processRateSchema, required: true },
            metallicColor: { type: processRateSchema, required: true },
            mattFinish: { type: processRateSchema, required: true },
            singleLamination: { type: processRateSchema, required: true },
            doubleLamination: { type: processRateSchema, required: true },
            slitting: { type: processRateSchema, required: true },
        },
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
    },
    {
        collection: "gravureCompanies",
        versionKey: false,
    },
);

// Auto-update updatedAt on save
gravureCompanySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Auto-update updatedAt on findByIdAndUpdate
gravureCompanySchema.pre("findByIdAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const GravureCompany = mongoose.model("GravureCompany", gravureCompanySchema);

export default GravureCompany;
