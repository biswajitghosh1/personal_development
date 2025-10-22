from flask import Blueprint, render_template, request, redirect, url_for, flash
from werkzeug.security import check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from .db import get_user_by_username
from .models import User

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        user_row = get_user_by_username(username)
        if user_row and check_password_hash(user_row["password_hash"], password):
            user = User(id=user_row["id"], username=user_row["username"])
            login_user(user)
            flash("Logged in successfully.", "success")
            next_url = request.args.get("next") or url_for("main.index")
            return redirect(next_url)
        flash("Invalid username or password", "warning")
    return render_template("login.html")

@bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Logged out.", "success")
    return redirect(url_for("main.index"))
