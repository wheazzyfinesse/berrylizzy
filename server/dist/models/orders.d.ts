import mongoose, { Schema } from "mongoose";
export declare const ShippingAddressSchema: Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    user: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
}, mongoose.Document<unknown, {}, {
    user: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    user: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    user: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
declare const Order: mongoose.Model<{
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    orderItems: mongoose.Types.DocumentArray<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, {}, {}> & {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }>;
    shippingAddress?: {
        user: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    paymentStatus: "failed" | "paid" | "pending" | "refunded";
    paymentMethod: "cash" | "paystack";
    paymentAttempts: mongoose.Types.DocumentArray<{
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, {}, {}> & {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }>;
    paymentReference?: string | null;
    refundReference?: string | null;
    refundStatus: "failed" | "needs-attention" | "not_requested" | "pending" | "processed" | "processing";
    orderStatus: "cancelled" | "delivered" | "placed" | "processing" | "shipped";
    subtotal: number;
    shippingCost: number;
    tax: number;
    stockReserved: boolean;
    reservationExpiresAt?: NativeDate | null;
    totalAmount: number;
    notes?: string | null;
    deliveredAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    orderItems: mongoose.Types.DocumentArray<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, {}, {}> & {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }>;
    shippingAddress?: {
        user: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    paymentStatus: "failed" | "paid" | "pending" | "refunded";
    paymentMethod: "cash" | "paystack";
    paymentAttempts: mongoose.Types.DocumentArray<{
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, {}, {}> & {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }>;
    paymentReference?: string | null;
    refundReference?: string | null;
    refundStatus: "failed" | "needs-attention" | "not_requested" | "pending" | "processed" | "processing";
    orderStatus: "cancelled" | "delivered" | "placed" | "processing" | "shipped";
    subtotal: number;
    shippingCost: number;
    tax: number;
    stockReserved: boolean;
    reservationExpiresAt?: NativeDate | null;
    totalAmount: number;
    notes?: string | null;
    deliveredAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    orderItems: mongoose.Types.DocumentArray<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, {}, {}> & {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }>;
    shippingAddress?: {
        user: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    paymentStatus: "failed" | "paid" | "pending" | "refunded";
    paymentMethod: "cash" | "paystack";
    paymentAttempts: mongoose.Types.DocumentArray<{
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, {}, {}> & {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }>;
    paymentReference?: string | null;
    refundReference?: string | null;
    refundStatus: "failed" | "needs-attention" | "not_requested" | "pending" | "processed" | "processing";
    orderStatus: "cancelled" | "delivered" | "placed" | "processing" | "shipped";
    subtotal: number;
    shippingCost: number;
    tax: number;
    stockReserved: boolean;
    reservationExpiresAt?: NativeDate | null;
    totalAmount: number;
    notes?: string | null;
    deliveredAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    orderItems: mongoose.Types.DocumentArray<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, {}, {}> & {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }>;
    shippingAddress?: {
        user: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    paymentStatus: "failed" | "paid" | "pending" | "refunded";
    paymentMethod: "cash" | "paystack";
    paymentAttempts: mongoose.Types.DocumentArray<{
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, {}, {}> & {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }>;
    paymentReference?: string | null;
    refundReference?: string | null;
    refundStatus: "failed" | "needs-attention" | "not_requested" | "pending" | "processed" | "processing";
    orderStatus: "cancelled" | "delivered" | "placed" | "processing" | "shipped";
    subtotal: number;
    shippingCost: number;
    tax: number;
    stockReserved: boolean;
    reservationExpiresAt?: NativeDate | null;
    totalAmount: number;
    notes?: string | null;
    deliveredAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    orderItems: mongoose.Types.DocumentArray<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, {}, {}> & {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }>;
    shippingAddress?: {
        user: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    paymentStatus: "failed" | "paid" | "pending" | "refunded";
    paymentMethod: "cash" | "paystack";
    paymentAttempts: mongoose.Types.DocumentArray<{
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, {}, {}> & {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }>;
    paymentReference?: string | null;
    refundReference?: string | null;
    refundStatus: "failed" | "needs-attention" | "not_requested" | "pending" | "processed" | "processing";
    orderStatus: "cancelled" | "delivered" | "placed" | "processing" | "shipped";
    subtotal: number;
    shippingCost: number;
    tax: number;
    stockReserved: boolean;
    reservationExpiresAt?: NativeDate | null;
    totalAmount: number;
    notes?: string | null;
    deliveredAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    orderItems: mongoose.Types.DocumentArray<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, {}, {}> & {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }>;
    shippingAddress?: {
        user: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    paymentStatus: "failed" | "paid" | "pending" | "refunded";
    paymentMethod: "cash" | "paystack";
    paymentAttempts: mongoose.Types.DocumentArray<{
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, {}, {}> & {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }>;
    paymentReference?: string | null;
    refundReference?: string | null;
    refundStatus: "failed" | "needs-attention" | "not_requested" | "pending" | "processed" | "processing";
    orderStatus: "cancelled" | "delivered" | "placed" | "processing" | "shipped";
    subtotal: number;
    shippingCost: number;
    tax: number;
    stockReserved: boolean;
    reservationExpiresAt?: NativeDate | null;
    totalAmount: number;
    notes?: string | null;
    deliveredAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    orderItems: mongoose.Types.DocumentArray<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, {}, {}> & {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }>;
    shippingAddress?: {
        user: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    paymentStatus: "failed" | "paid" | "pending" | "refunded";
    paymentMethod: "cash" | "paystack";
    paymentAttempts: mongoose.Types.DocumentArray<{
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, {}, {}> & {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }>;
    paymentReference?: string | null;
    refundReference?: string | null;
    refundStatus: "failed" | "needs-attention" | "not_requested" | "pending" | "processed" | "processing";
    orderStatus: "cancelled" | "delivered" | "placed" | "processing" | "shipped";
    subtotal: number;
    shippingCost: number;
    tax: number;
    stockReserved: boolean;
    reservationExpiresAt?: NativeDate | null;
    totalAmount: number;
    notes?: string | null;
    deliveredAt?: NativeDate | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    orderItems: mongoose.Types.DocumentArray<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }, {}, {}> & {
        product: mongoose.Types.ObjectId;
        quantity: number;
        name: string;
        size: string;
        price: number;
    }>;
    shippingAddress?: {
        user: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    paymentStatus: "failed" | "paid" | "pending" | "refunded";
    paymentMethod: "cash" | "paystack";
    paymentAttempts: mongoose.Types.DocumentArray<{
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }, {}, {}> & {
        reference: string;
        status: "failed" | "initializing" | "paid" | "pending";
        createdAt: NativeDate;
    }>;
    paymentReference?: string | null;
    refundReference?: string | null;
    refundStatus: "failed" | "needs-attention" | "not_requested" | "pending" | "processed" | "processing";
    orderStatus: "cancelled" | "delivered" | "placed" | "processing" | "shipped";
    subtotal: number;
    shippingCost: number;
    tax: number;
    stockReserved: boolean;
    reservationExpiresAt?: NativeDate | null;
    totalAmount: number;
    notes?: string | null;
    deliveredAt?: NativeDate | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & Required<{
    _id: mongoose.Types.ObjectId;
}>>;
export default Order;
//# sourceMappingURL=orders.d.ts.map