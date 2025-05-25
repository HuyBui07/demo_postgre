-- Phần 1: Xóa bảng cũ và các loại ENUM (nếu có) để chuẩn bị tái cấu trúc
DROP TABLE IF EXISTS todo_item_tags, todo_items, tags, todo_lists;
DROP TYPE IF EXISTS todo_status, todo_priority;

---

-- Phần 2: Định nghĩa các kiểu dữ liệu ENUM
-- Sử dụng ENUM cho trạng thái công việc để có các giá trị rõ ràng và hạn chế lỗi
CREATE TYPE todo_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
-- Sử dụng ENUM cho độ ưu tiên
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high', 'urgent');

---

-- Phần 3: Tạo bảng mới với các tính năng nâng cao
CREATE TABLE todo_lists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE todo_items (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES todo_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status todo_status DEFAULT 'pending',
    priority todo_priority DEFAULT 'low',
    metadata JSONB DEFAULT '{}',
    full_description TEXT GENERATED ALWAYS AS (
        CASE
            WHEN description IS NOT NULL THEN title || ' - ' || description
            ELSE title
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE todo_item_tags (
    item_id INTEGER REFERENCES todo_items(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, tag_id)
);



-- Phần 4: Chèn dữ liệu mẫu

INSERT INTO todo_lists (title) VALUES
('Việc cần làm hôm nay'),
('Công việc ở trường'),
('Dự án cá nhân'),
('Mua sắm hàng tuần');

-- Dữ liệu cho "Việc cần làm hôm nay" (id = 1)
INSERT INTO todo_items (list_id, title, description, due_date, status, priority, metadata)
VALUES
(1, 'Dậy sớm tập thể dục', 'Chạy bộ 30 phút', '2025-05-25', 'pending', 'high',
    jsonb_build_object('reminder', '2025-05-25 07:00:00', 'location', 'Công viên')),
(1, 'Mua đồ ăn sáng', NULL, '2025-05-25', 'completed', 'low',
    jsonb_build_object('purchased_items', jsonb_build_array('Bánh mì', 'Sữa'))),
(1, 'Đọc sách 20 phút', 'Sách: Atomic Habits', '2025-05-25', 'in_progress', 'medium',
    jsonb_build_object('page_read', 50));

-- Dữ liệu cho "Công việc ở trường" (id = 2)
INSERT INTO todo_items (list_id, title, description, due_date, status, priority, metadata)
VALUES
(2, 'Làm bài tập Toán rời rạc', 'Bài 5 và 6 trang 80', '2025-05-27', 'pending', 'urgent',
    jsonb_build_object('course', 'Toán Rời Rạc', 'submission_method', 'Online')),
(2, 'Chuẩn bị bài thuyết trình Vật lý', 'Nhóm 4, tuần sau', '2025-06-01', 'in_progress', 'high',
    jsonb_build_object('group_members', jsonb_build_array('An', 'Bình', 'Châu'))),
(2, 'Ôn tập Đại số tuyến tính', 'Chương 1-3', '2025-05-29', 'pending', 'medium', '{}'),
(2, 'Viết báo cáo Thực tập', 'Hoàn thành phần mở đầu', '2025-06-05', 'pending', 'high', '{}');


-- Dữ liệu cho "Dự án cá nhân" (id = 3)
INSERT INTO todo_items (list_id, title, description, due_date, status, priority)
VALUES
(3, 'Thiết kế UI màn hình login', NULL, '2025-05-28', 'pending', 'urgent'),
(3, 'Kết nối database PostgreSQL', 'Sử dụng Sequelize hoặc Knex.js', '2025-05-30', 'in_progress', 'high');

-- Dữ liệu cho "Mua sắm hàng tuần" (id = 4)
INSERT INTO todo_items (list_id, title, description, due_date, status, priority)
VALUES
(4, 'Mua rau củ', 'Cà rốt, khoai tây, cà chua', '2025-05-26', 'pending', 'low'),
(4, 'Mua thịt', 'Thịt gà, thịt bò', '2025-05-26', 'pending', 'medium');


INSERT INTO tags (name) VALUES
('Quan trọng'),
('Khẩn cấp'),
('Cá nhân'),
('Trường học'),
('Dự án'),
('Mua sắm');

-- Gắn tags cho các công việc
INSERT INTO todo_item_tags (item_id, tag_id) VALUES
(1, (SELECT id FROM tags WHERE name = 'Quan trọng')),
(1, (SELECT id FROM tags WHERE name = 'Cá nhân')),
(2, (SELECT id FROM tags WHERE name = 'Cá nhân')),
(4, (SELECT id FROM tags WHERE name = 'Trường học')),
(4, (SELECT id FROM tags WHERE name = 'Khẩn cấp')),
(6, (SELECT id FROM tags WHERE name = 'Dự án')),
(8, (SELECT id FROM tags WHERE name = 'Mua sắm')),
(9, (SELECT id FROM tags WHERE name = 'Mua sắm'));