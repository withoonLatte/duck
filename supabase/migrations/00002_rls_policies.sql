-- DUCK NOODLE RESTAURANT OS -- ROW LEVEL SECURITY POLICIES
CREATE OR REPLACE FUNCTION current_restaurant_id() RETURNS UUID AS 
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'restaurant_id', '')::uuid;
 LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_branch_id() RETURNS UUID AS 
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'branch_id', '')::uuid;
 LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION has_permission(required_perm TEXT) RETURNS BOOLEAN AS 
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
      AND ur.restaurant_id = current_restaurant_id()
      AND p.code = required_perm
  );
 LANGUAGE SQL STABLE SECURITY DEFINER;

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_drawers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_restaurants ON restaurants FOR ALL USING (id = current_restaurant_id());
CREATE POLICY tenant_isolation_branches ON branches FOR ALL USING (restaurant_id = current_restaurant_id());
CREATE POLICY tenant_isolation_products ON products FOR ALL USING (restaurant_id = current_restaurant_id());
CREATE POLICY tenant_isolation_orders ON orders FOR ALL USING (restaurant_id = current_restaurant_id() AND (branch_id = current_branch_id() OR current_branch_id() IS NULL));
CREATE POLICY tenant_isolation_bills ON bills FOR ALL USING (restaurant_id = current_restaurant_id() AND (branch_id = current_branch_id() OR current_branch_id() IS NULL));
CREATE POLICY tenant_isolation_tables ON restaurant_tables FOR ALL USING (branch_id = current_branch_id() OR current_branch_id() IS NULL);
CREATE POLICY tenant_isolation_audit ON audit_logs FOR ALL USING (restaurant_id = current_restaurant_id());
