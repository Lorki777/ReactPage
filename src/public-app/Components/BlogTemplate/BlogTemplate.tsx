import React from "react";
import { useParams } from "react-router-dom";
import "./BlogTemplate.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import { useBlog } from "../Hook";

const BlogTemplate: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const { blog, error } = useBlog(blogId);

  if (error) return <p>Error al cargar el blog.</p>;
  if (!blog) return <p>Cargando...</p>;

  return (
    <>
      <HelmetReact>
        <title>{blog.title}</title>
        {/* Inyectamos CSS personalizado */}
        {blog.custom_css && <style type="text/css">{blog.custom_css}</style>}
      </HelmetReact>
      <Header />

      {/* Portada con imagen de fondo */}
      <div
        className="PortadaBlogTemplate"
        style={{ backgroundImage: `url(${blog.blog_header_image})` }}
      >
        <h3>{blog.title}</h3>
      </div>

      {/* Cuerpo del post */}
      <div className="CuerpoBlog">
        {/* Publicado */}
        <p>
          <em>
            Publicado el{" "}
            {new Date(blog.published_date).toLocaleDateString("es-MX")}
          </em>
        </p>
        {/* Contenido HTML deserializado */}
        <div dangerouslySetInnerHTML={{ __html: blog.content_html }} />
      </div>

      <Footer />
    </>
  );
};

export default BlogTemplate;
