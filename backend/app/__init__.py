from flask import Flask, jsonify

from .config import config_by_name
from .extensions import cors, db, jwt, migrate
from .routes.admin import admin_bp
from .routes.appointments import appointments_bp
from .routes.auth import auth_bp
from .routes.catalog import catalog_bp
from .routes.reminders import reminders_bp


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_URL"]}})

    app.register_blueprint(auth_bp)
    app.register_blueprint(catalog_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(reminders_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app
