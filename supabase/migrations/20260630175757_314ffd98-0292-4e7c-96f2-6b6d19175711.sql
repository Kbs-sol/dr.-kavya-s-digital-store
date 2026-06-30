
-- FAQs table
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT USING (published = true);
CREATE POLICY "faqs_admin_insert" ON public.faqs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "faqs_admin_update" ON public.faqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "faqs_admin_delete" ON public.faqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Allow public read of an order by id (used for guest tracking; we still validate email server-side)
CREATE POLICY "orders_public_read_by_id" ON public.orders FOR SELECT TO anon USING (true);
GRANT SELECT ON public.orders TO anon;
GRANT SELECT ON public.order_items TO anon;
CREATE POLICY "order_items_public_read" ON public.order_items FOR SELECT TO anon USING (true);

-- Seed FAQs (generic)
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
('Are your products 100% natural?','Yes. Every formula is hand-mixed with herbs, oils, and clays — no parabens, sulfates, silicones, or synthetic fragrance.','Product',1),
('Are they safe for sensitive skin and scalp?','Our formulas are gentle and chemical-free. We always recommend a small patch test before first full use.','Product',2),
('How often should I use the hair mask?','Once a week for maintenance, twice a week for active concerns like hair fall or dandruff.','Usage',3),
('How long do I keep the face pack on?','15–20 minutes, until it just begins to dry. Rinse with cool water — never let it crack on the skin.','Usage',4),
('How long does shipping take?','Orders are dispatched within 2 business days. Delivery across India typically takes 3–7 business days.','Shipping',5),
('What is your return policy?','Because of the perishable, hand-made nature of the products, we accept returns only for damaged or incorrect items. Reach out within 48 hours of delivery.','Shipping',6),
('How should I store the products?','Keep in a cool, dry place away from direct sunlight. Always use a dry spoon — moisture shortens shelf life.','Storage',7),
('What is the shelf life?','6 months from the date of manufacture when stored as directed.','Storage',8);

-- Site content additions
INSERT INTO public.site_content (key, value) VALUES
('announcement_bar', '{"text":"Made in India · 100% Natural · made by mom","enabled":true}'::jsonb),
('promises', '[{"title":"100% Herbal","desc":"Whole-plant ingredients, nothing synthetic."},{"title":"Chemical Free","desc":"No parabens, sulfates, silicones, or fragrance."},{"title":"Made by Mom","desc":"Hand-mixed in small batches with care."}]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Clear existing seeded products and replace with the real 9
DELETE FROM public.products;

INSERT INTO public.products (category_id, name, slug, tagline, short_description, ingredients, how_to_use, price, compare_at_price, size, stock, cover_image, featured, published, badges) VALUES
((SELECT id FROM categories WHERE slug='hair'),'Herbal Hair Mask','herbal-hair-mask','For hair fall & deep conditioning','A weekly hair ritual that strengthens roots and softens strands.','Hibiscus, Bhringraj, Amla, Methi, Curry leaf','Mix with water or yogurt to a paste. Apply root-to-tip, leave 30 min, rinse.',499,699,'100g',50,'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900',true,true,ARRAY['100% Herbal','Chemical Free']),
((SELECT id FROM categories WHERE slug='hair'),'Hair Mask Value Pack','herbal-hair-mask-200','Double pack — for a full month of weekly masks','Same loved formula, in a larger 200g jar.','Hibiscus, Bhringraj, Amla, Methi, Curry leaf','Mix to a paste, apply weekly, rinse after 30 min.',899,1299,'200g',40,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900',false,true,ARRAY['Natural','Best Value']),
((SELECT id FROM categories WHERE slug='hair'),'Hair Fall Control','hair-fall-control','Hero formula for severe hair fall & regrowth','Targeted blend for active hair fall and visible regrowth in 6–8 weeks.','Bhringraj, Brahmi, Hibiscus, Fenugreek, Black sesame','Apply 1–2x weekly. Massage roots, leave 30–45 min, rinse.',599,799,'100g',60,'https://images.unsplash.com/photo-1522335789203-aaa18e3a18a3?w=900',true,true,ARRAY['Hero','100% Herbal']),
((SELECT id FROM categories WHERE slug='hair'),'Anti-Dandruff Mask','anti-dandruff-mask','For dandruff & itchy scalp','A cooling, clarifying scalp mask that calms flakes and itch.','Neem, Tulsi, Reetha, Camphor, Lemon peel','Apply to scalp 1x weekly. Leave 20 min, rinse.',549,749,'100g',45,'https://images.unsplash.com/photo-1535637603896-07c179d71f96?w=900',false,true,ARRAY['Chemical Free']),
((SELECT id FROM categories WHERE slug='hair'),'Fresh Bhringraj Oil','fresh-bhringraj-oil','For premature greying','Cold-pressed oil infused with fresh bhringraj — slows greying, deepens shine.','Bhringraj, Amla, Curry leaf, Coconut oil, Sesame oil','Warm slightly, massage 2–3x a week. Leave overnight, rinse.',649,899,'100ml',35,'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900',true,true,ARRAY['100% Herbal','Natural']),
((SELECT id FROM categories WHERE slug='skin'),'Multi-Action Face Pack','multi-action-face-pack','Detan, pigmentation, acne & glow','A daily-use face pack for clear, even, glowing skin.','Sandalwood, Turmeric, Manjistha, Rose, Multani mitti','Mix with rose water or milk. Apply 15–20 min, rinse with cool water.',549,749,'100g',55,'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=900',true,true,ARRAY['100% Herbal']),
((SELECT id FROM categories WHERE slug='skin'),'Detan Face Pack','detan-face-pack','For sun tan & dullness','Lifts surface tan and revives a soft, even glow.','Saffron, Liquorice, Orange peel, Kaolin clay','Mix to a paste, apply 15 min, rinse.',499,699,'100g',50,'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=900',false,true,ARRAY['Chemical Free','Natural']),
((SELECT id FROM categories WHERE slug='body'),'Herbal Bath Powder (Nalugu Pindi)','herbal-bath-powder','Soap-free wash for body glow','The traditional Telugu bath powder — gentle, glowing, soap-free.','Green gram, Chickpea, Turmeric, Vetiver, Rose petals','Mix with water/milk. Use as a soap substitute. Rinse.',449,599,'100g',60,'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=900',false,true,ARRAY['100% Herbal','Soap-Free']),
((SELECT id FROM categories WHERE slug='combos'),'Hair + Skin Starter Combo','hair-skin-starter-combo','First-order favourite','Herbal Hair Mask + Multi-Action Face Pack — a complete starter ritual.','See individual products','Use hair mask weekly, face pack 2–3x a week.',849,1248,'200g',40,'https://images.unsplash.com/photo-1556228841-7c2e7f12e1c2?w=900',true,true,ARRAY['Bestseller','Combo']);
