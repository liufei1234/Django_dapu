# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=80)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DapuShopBottomImg(models.Model):
    bottom_url = models.CharField(max_length=300)
    shop = models.ForeignKey('DapuShopShop', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'dapu_shop_bottom_img'


class DapuShopCategory(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'dapu_shop_category'


class DapuShopColor(models.Model):
    color = models.CharField(max_length=20)
    shop = models.ForeignKey('DapuShopShop', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'dapu_shop_color'


class DapuShopComment(models.Model):
    content = models.TextField()
    author = models.CharField(max_length=40)
    callback_con = models.CharField(max_length=200)
    create_time = models.CharField(max_length=200)
    shop = models.ForeignKey('DapuShopShop', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'dapu_shop_comment'


class DapuShopSCategory(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'dapu_shop_s_category'


class DapuShopShop(models.Model):
    name = models.CharField(max_length=50)
    goods_number = models.CharField(max_length=50)
    price = models.CharField(max_length=50)
    vip_price = models.CharField(max_length=50)
    sales_volume = models.IntegerField()
    integral = models.IntegerField()
    att_color = models.CharField(max_length=50)
    desc_top = models.CharField(max_length=400)
    att_size = models.CharField(max_length=200)
    product_te = models.CharField(max_length=200)
    operative_norm = models.CharField(max_length=200)
    safety_standards = models.CharField(max_length=200)
    product_grade = models.CharField(max_length=200)
    plus_material = models.CharField(max_length=200)
    pack_spe = models.CharField(max_length=200)
    pack_content = models.CharField(db_column='pack_Content', max_length=200)  # Field name made lowercase.
    category = models.ForeignKey(DapuShopCategory, models.DO_NOTHING)
    s_category = models.ForeignKey(DapuShopSCategory, models.DO_NOTHING)

    class Meta:
        db_table = 'dapu_shop_shop'


class DapuShopShopTags(models.Model):
    shop = models.ForeignKey(DapuShopShop, models.DO_NOTHING)
    tag = models.ForeignKey('DapuShopTag', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'dapu_shop_shop_tags'
        unique_together = (('shop', 'tag'),)


class DapuShopStandar(models.Model):
    stander = models.CharField(max_length=200)
    shop = models.ForeignKey(DapuShopShop, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'dapu_shop_standar'


class DapuShopTag(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'dapu_shop_tag'


class DapuShopTopImg(models.Model):
    top_url = models.CharField(max_length=300)
    shop = models.ForeignKey(DapuShopShop, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'dapu_shop_top_img'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'
