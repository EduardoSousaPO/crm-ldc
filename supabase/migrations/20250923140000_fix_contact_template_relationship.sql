-- Adiciona a chave estrangeira que faltava na tabela contact_attempts,
-- ligando a coluna `template_used` ao `id` da tabela `follow_up_templates`.
-- Isso permite que o Supabase identifique a relação e realize o join na API.

ALTER TABLE public.contact_attempts
ADD CONSTRAINT fk_follow_up_template
FOREIGN KEY (template_used)
REFERENCES public.follow_up_templates(id)
ON DELETE SET NULL; -- Se um template for deletado, o campo na tentativa de contato ficará nulo.

COMMENT ON CONSTRAINT fk_follow_up_template ON public.contact_attempts IS 'Garante que cada template usado em uma tentativa de contato exista na tabela de templates.';
