CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE order_status AS ENUM ('unplanned', 'planned', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE shipment_status AS ENUM ('built', 'planned', 'routed' , 'in_transit', 'delivered', 'cancelled');
CREATE TYPE direction as ENUM ('inbound' , 'outbound');
CREATE TYPE product_type AS ENUM ('component' , 'finished_good');



CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
);

CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(255) NOT NULL,
    CONSTRAINT fk_company_id FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE customer_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id)
);


CREATE TABLE suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    CONSTRAINT fk_company_id FOREIGN KEY (company_id) REFERENCES companies(id)
);


CREATE TABLE shipper_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    erp_id VARCHAR(4) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    CONSTRAINT fk_company_id FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE OR REPLACE FUNCTION order_creation_validation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.direction_category = 'outbound' AND NOT EXISTS (SELECT 1 FROM shipper_locations WHERE id = NEW.origin_id)
    THEN RAISE EXCEPTION 'Outbound orders must originate from a shipper location';
    END IF;

    IF NEW.direction_category = 'inbound' AND NOT EXISTS (SELECT 1 FROM shipper_locations WHERE id = NEW.destination_id)
    THEN RAISE EXCEPTION 'Inbound orders must deliver to a shipper location';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE erp_shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    direction_category direction NOT NULL,
    tms_shipment_number VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    carrier_name VARCHAR(255),
    requested_pickup_date DATE NOT NULL,
    requested_delivery_date DATE NOT NULL,
    actual_pickup_date DATE,
    actual_delivery_date DATE,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE erp_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    direction_category direction NOT NULL,
    company_id UUID NOT NULL,
    customer_id UUID,
    customer_location_id UUID,
    supplier_id UUID,
    shipper_id UUID,
    origin_id UUID NOT NULL,
    destination_id UUID NOT NULL,
    order_number VARCHAR(255) NOT NULL UNIQUE,
    customer_po_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requested_ship_date DATE NOT NULL,
    order_status order_status NOT NULL,
    shipment_id UUID,
    tms_status VARCHAR(50),

    CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_supplier_id FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_shipment_id FOREIGN KEY (shipment_id) REFERENCES erp_shipments(id),
    CONSTRAINT fk_company_id FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_shipper_id FOREIGN KEY (shipper_id) REFERENCES shipper_locations(id),
    CONSTRAINT fk_customer_location_id FOREIGN KEY (customer_location_id) REFERENCES customer_locations(id)
);

CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    material_number VARCHAR(255) NOT NULL,
    product_type product_type NOT NULL,
    description VARCHAR(255) NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    freight_class VARCHAR(10) NOT NULL,
    unit_of_measure VARCHAR(10) NOT NULL,
    CONSTRAINT fk_company_id FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE supplier_products (
    supplier_id UUID NOT NULL,
    product_id UUID NOT NULL,
    PRIMARY KEY (supplier_id, product_id),
    CONSTRAINT fk_supplier_id FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE order_line_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT NOT NULL,
    total_weight_lbs DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES erp_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(255) NOT NULL UNIQUE
);

CREATE TRIGGER trigger_order_creation_validation
BEFORE INSERT ON erp_orders
FOR EACH ROW
EXECUTE FUNCTION order_creation_validation();





