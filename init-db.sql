-- HTML Card Viewer Database Schema
-- PostgreSQL初始化脚本

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建文件表
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100) DEFAULT 'other',
    tags TEXT[], -- PostgreSQL数组类型
    author VARCHAR(255),
    version VARCHAR(50),
    file_size BIGINT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    has_history BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建版本历史表
CREATE TABLE IF NOT EXISTS file_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(file_id, version_number)
);

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(50),
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户会话表（用于跟踪用户活动）
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address INET,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_upload_date ON files(upload_date);
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_created_at ON file_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为files表创建更新时间触发器
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入默认分类数据
INSERT INTO categories (id, name, icon, color, description) VALUES
('dashboard', '仪表板', 'pi-chart-line', '#3B82F6', '数据可视化和仪表板页面'),
('portfolio', '作品集', 'pi-briefcase', '#10B981', '个人或公司作品展示页面'),
('documentation', '文档', 'pi-book', '#F59E0B', '文档和说明页面'),
('template', '模板', 'pi-palette', '#EF4444', '可重用的页面模板'),
('landing', '落地页', 'pi-home', '#8B5CF6', '营销和推广落地页'),
('admin', '管理面板', 'pi-cog', '#6B7280', '后台管理和控制面板'),
('ecommerce', '电子商务', 'pi-shopping-cart', '#EC4899', '在线商店和购物页面'),
('blog', '博客', 'pi-pencil', '#06B6D4', '博客和文章页面'),
('other', '其他', 'pi-folder', '#84CC16', '其他类型的页面')
ON CONFLICT (id) DO NOTHING;

-- 插入默认系统配置
INSERT INTO system_config (key, value, description) VALUES
('app_version', '1.0.0', '应用程序版本'),
('default_language', 'zh', '默认语言'),
('default_theme', 'light', '默认主题'),
('max_upload_size', '10485760', '最大上传文件大小(字节)'),
('allowed_file_types', 'html,htm', '允许的文件类型'),
('enable_version_history', 'true', '是否启用版本历史'),
('auto_backup_enabled', 'true', '是否启用自动备份')
ON CONFLICT (key) DO NOTHING;

-- 创建视图：文件统计
CREATE OR REPLACE VIEW file_statistics AS
SELECT
    COUNT(*) as total_files,
    COUNT(DISTINCT category) as total_categories,
    SUM(file_size) as total_size,
    AVG(file_size) as avg_size,
    MAX(upload_date) as latest_upload,
    MIN(upload_date) as earliest_upload
FROM files;

-- 创建视图：分类统计
CREATE OR REPLACE VIEW category_statistics AS
SELECT
    c.id,
    c.name,
    c.color,
    COUNT(f.id) as file_count,
    COALESCE(SUM(f.file_size), 0) as total_size
FROM categories c
LEFT JOIN files f ON c.id = f.category
GROUP BY c.id, c.name, c.color
ORDER BY file_count DESC;

-- 授予权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO htmlviewer;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO htmlviewer;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO htmlviewer;