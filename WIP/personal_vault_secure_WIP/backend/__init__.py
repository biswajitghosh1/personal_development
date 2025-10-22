import os
from flask import Flask
from flask_login import LoginManager
from .models import User

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def create_app():
    template_folder = os.path.join(BASE_DIR, "frontend", "templates")
    static_folder = os.path.join(BASE_DIR, "frontend", "static")
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)

    app.config.from_mapping(
        SECRET_KEY=os.environ.get("PV_APP_SECRET", "change-me-for-production"),
        DATABASE=os.path.join(app.instance_path, "vault.db"),
    )

    # ensure instance folder exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    # login manager
    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    from .db import get_user_by_id

    @login_manager.user_loader
    def load_user(user_id):
        u = get_user_by_id(user_id)
        if not u:
            return None
        return User(id=u["id"], username=u["username"])

    # register blueprints
    from .auth import bp as auth_bp
    from .routes import bp as main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    return app
